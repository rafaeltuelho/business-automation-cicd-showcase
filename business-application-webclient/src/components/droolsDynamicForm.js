import "@patternfly/react-core/dist/styles/base.css";

import KieClient from './kieClient';
import { loadFromLocalStorage } from './util'
import { AutoForm } from 'uniforms-patternfly';
import { DroolsResultsRenderer }  from './dmnResultsCardRenderer'
import JSCodeEditor from './codeEditor';
import _ from 'lodash';
import './fonts.css';
import CodeIcon from '@patternfly/react-icons/dist/js/icons/code-icon';

import React from 'react';
import {
  Button,
  Modal,
  ModalVariant,
  Title,
  ExpandableSection,
  Grid,
  GridItem,
  Spinner,
  Stack,
  StackItem,
  Tabs, 
  Tab, 
  TabTitleIcon,
  TabTitleText,
  Alert, 
  AlertGroup, 
  AlertActionCloseButton, 
  AlertVariant,
  Drawer,
  DrawerPanelContent,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  Tooltip,
  TextContent,
  Text,
  TextVariants,  
} from '@patternfly/react-core';
import ReactJson from 'react-json-view'

import { DEMO_SIMPLE_SCHEMA, DEMO_SIMPLE_SCHEMA_CODE } from './demoFormSchema';

class DroolsDynamicForm extends React.Component {
  constructor(props) {
    super(props);

    const kieSettings = loadFromLocalStorage('kieSettings', true);
    const schemaWrapper = loadFromLocalStorage('schemaWrapper', true);
    this.kieClient = new KieClient(kieSettings);
    this.formRef = null; //AutoForm reference

    let schemaBridge = DEMO_SIMPLE_SCHEMA;
    let schemaCode = DEMO_SIMPLE_SCHEMA_CODE;
    // console.debug('schemaCode: ', schemaCode);
    if (schemaWrapper?.code) {
      schemaCode = schemaWrapper.code;
      schemaBridge = eval(`(${schemaWrapper.code})`);
    }

    this.state = {
      formBridgeSchema: schemaBridge,
      formBridgeSchemaCode: schemaCode,
      _renderForm: true,
      _apiCallStatus: 'NONE',
      _rawServerRequest: { },
      _rawServerResponse: { },
      _serverResponse: { },
      _responseErrorAlertVisible: false,
      _responseModalOpen: false,
      alerts: [ ],
      _isDebugExpanded: false,
      activeTabKey: 0,
      isExpanded: false,
    };

    this.drawerRef = React.createRef();
  }

  // Toggle currently active tab
  handleTabClick = (event, tabIndex) => {
    this.setState({
      activeTabKey: tabIndex,
    });
  };

  onFormSubmit = (data) => {
    this.setState({
      _apiCallStatus: 'WAITING',
      _responseModalOpen: true,      
    });

    // iterate over the AutoForm's model, extract each root Object as Fact
    let facts = [];
    _.map(data, (v, k, o) => {
      // console.debug('building drools fact for: ', k);
      //TODO: test if v is and array of obj...
      const f = this.kieClient.newInsertCommand({ [k]: v }, k, true);      
      facts.push(f);
    });
    // console.debug('drools facts: ', facts);
    // build server request payload just for debug purposes
    const rawServerRequest = this.kieClient.buildDroolsRequestBody(facts);

    this.kieClient
      .fireRules(facts)
      .then((response) => {
        this.setState({
          _apiCallStatus: 'COMPLETE',
          _responseModalOpen: true,
          _rawServerResponse: response.response,
          _serverResponse: response.response.result['execution-results'].results,
        });

        // scroll the page to make alert visible
        this.scrollToTop();
      })
      .catch(err => {
        this.setState({
          _apiCallStatus: 'ERROR',
          _responseModalOpen: false,
          _rawServerResponse: {
            result: {},
          },
        })
        const msg = (err.status ? err.status : err) + '' + (err.response ? ': ' + err.response : '');
        this.addAlert(msg, 'danger', new Date().getTime);
        this.scrollToTop();
      })
      .finally(() => {
        this.setState({
          _rawServerRequest: rawServerRequest,
        })
      });
  };

  onInputChange = ({name, value}) => {
    this.setState( { [name]: value } );
  };  

  // handler for Text fields
  handleTextInputChange = (value, event) => {
    const { id } = event.currentTarget;
    this.onInputChange({ name: id, value });
  };

  // handler for Radio fields
  handleRadioInputChange = (_, event) => {
    const { name } = event.currentTarget;
    const checkedValue = event.target.value;
    this.onInputChange({ name, value: checkedValue });
  };  

  // handler for Select fields
  handleSelectInputChange = (value, event) => {
    const { id } = event.currentTarget;
    this.onInputChange({ name: id, value });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.debug('DroolsDynamicForm ->>> componentDidUpdate...');
  }

  componentDidMount() {
    console.debug('DroolsDynamicForm ->>> componentDidMount...');
  }

  componentWillUnmount() {
    console.debug('DroolsDynamicForm ->>> componentWillUnmount...');
  }

  handleModalToggle = () => {
    this.setState(({ _responseModalOpen }) => ({
      _responseModalOpen: !_responseModalOpen
    }));
  };

  onDebugViewToggle = (isExpanded) => {
    this.setState({
      _isDebugExpanded: isExpanded
    });
  };  

  scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  updateState = (formModelData) => {
    // iterate over the AutoForm's model, extract each root Object as Fact
    let facts = [];
    _.map(formModelData, (v, k, o) => {
      // console.debug('building drools fact for: ', k);
      const f = this.kieClient.newInsertCommand({ [k]: v }, k, true);      
      facts.push(f);
    });
    // console.debug('drools facts: ', facts);
    // build server request payload just for debug purposes
    const rawServerRequest = this.kieClient.buildDroolsRequestBody(facts);    
    this.setState({_rawServerRequest: rawServerRequest});
  }

  handleFormSchemaState = (simpleSchema, code) => {
    if (this.formRef) {
      this.formRef.reset();
    }

    this.setState({
      formBridgeSchema: simpleSchema,
      formBridgeSchemaCode: code,
      _rawServerRequest: { },
      _rawServerResponse: { },
      _serverResponse: { },
    });

    const schemaWrapper = {
      code: code,
      format: 'SimpleSchema', // can handle different formats (Uniforms Bridge implementations) in the future!
    }
    // console.debug('saving form\'s SimpleSchema code into Browser\'s storage...', schemaWrapper);
    localStorage.setItem('schemaWrapper', JSON.stringify(schemaWrapper));    
  };

  addAlert = (title, variant, key) => {
    this.setState({
      alerts: [ ...this.state.alerts, { title: title, variant: variant, key }]
    });
  };

  removeAlert = key => {
    this.setState({ alerts: [...this.state.alerts.filter(el => el.key !== key)] });
  };

  onExpand = () => {
    this.drawerRef.current && this.drawerRef.current.focus();
  };

  onClick = () => {
    const isExpanded = !this.state.isExpanded;
    this.setState({
      isExpanded,
    });
  };

  onCloseClick = () => {
    this.setState({
      isExpanded: false
    });
  };  

  render() {
    const { isExpanded } = this.state;
    const panelContent = (
      <DrawerPanelContent
        isResizable={false}
        defaultSize={'900px'}
        minSize={'800px'}>
        <DrawerHead>
          <span tabIndex={isExpanded ? 0 : -1} ref={this.drawerRef}>
            Form Schema Definition
          </span>
          <JSCodeEditor
              ancestorStateHandler={this.handleFormSchemaState} 
              code={this.state.formBridgeSchemaCode} 
              addAlertHandler={this.addAlert} 
              removeAlertHandler={this.removeAlert} 
          />
          <DrawerActions>
            <DrawerCloseButton onClick={this.onCloseClick} />
          </DrawerActions>
        </DrawerHead>
      </DrawerPanelContent>
    );

    return (
      <>
      <AlertGroup isToast>
        {this.state.alerts.map(({key, variant, title}) => (
          <Alert
            isLiveRegion
            variant={AlertVariant[variant]}
            title={title}
            actionClose={
              <AlertActionCloseButton
                title={title}
                variantLabel={`${variant} alert`}
                onClose={() => this.removeAlert(key)}
              />
            }
            key={key} />
        ))}
      </AlertGroup>       
      
      <Tabs activeKey={this.state.activeTabKey} onSelect={this.handleTabClick}>
        {/* Form Section */}
        <Tab eventKey={0} 
          title={
            <>
              <TabTitleIcon>
                <Tooltip
                content={
                  <div>Click here to open the Form Schema Editor.</div>
                }
                >
                  <CodeIcon onClick={this.onClick} />
                </Tooltip>
              </TabTitleIcon> 
              <TabTitleText>Input Data</TabTitleText>
            </>
          }
        >
          <Drawer isExpanded={isExpanded} onExpand={this.onExpand}>
            <DrawerContent panelContent={panelContent}>
              <DrawerContentBody>

                <Stack hasGutter>
                  <StackItem>
                    <React.Fragment>
                      <Modal
                        variant={ModalVariant.medium}
                        title="Decision Results"
                        isOpen={this.state._responseModalOpen}
                        onClose={this.handleModalToggle}
                      >
                        {this.state._apiCallStatus === 'WAITING' && (<Spinner isSVG />)}
                        {this.state._apiCallStatus === 'COMPLETE' && (<DroolsResultsRenderer decisionResults={this.state._serverResponse} />)}
                      </Modal>
                    </React.Fragment>
                  </StackItem>
                  <StackItem isFilled>
                    {/** Auto Form */}
                    {this.state._renderForm && 
                      (<AutoForm
                        ref={ref => (this.formRef = ref)}
                        placeholder={true}
                        schema={this.state.formBridgeSchema} 
                        onChangeModel={model => this.updateState(model)} 
                        onSubmit={this.onFormSubmit} >
                      </AutoForm>)
                    }
                  </StackItem>
                  <StackItem>
                    <ExpandableSection toggleText="Debug View">
                      <Grid hasGutter>
                        <GridItem span={12}>
                          <TextContent>
                            <Text component={TextVariants.small}>Server endpoint: {this.state._rawServerResponse?.serverEndpointUrl}</Text>
                          </TextContent>
                        </GridItem>                           
                        <GridItem span={6}>
                        <Title headingLevel="h6" size="md">Request Payload</Title>
                          {/* <ReactJson name={false} src={this.state._rawServerRequest} */}
                          <ReactJson name={false} src={this.state._rawServerRequest}
                            onEdit={ e => { this.setState({ src: e.updated_src }); } }
                            onDelete={ e => { this.setState({ src: e.updated_src }); } }
                            onAdd={ e => { this.setState({ src: e.updated_src }); } }
                          />
                        </GridItem>
                        <GridItem span={6}>
                          <Title headingLevel="h6" size="md">Response Payload</Title>
                          <ReactJson name={false} src={this.state._rawServerResponse.result} />
                        </GridItem>
                      </Grid>
                    </ExpandableSection>
                  </StackItem>
                </Stack>
                
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </Tab>
      </Tabs>
      </>
    );
  }
}

export default DroolsDynamicForm;