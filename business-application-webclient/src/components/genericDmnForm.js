import "@patternfly/react-core/dist/styles/base.css";

import KieClient from './kieClient';
import { loadFromLocalStorage } from './util'
import './fonts.css';
import { AutoForm } from 'uniforms-patternfly';
import Ajv from 'ajv';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import ObjectAsCard  from './objectCardRenderer'

import React from 'react';
import {
  Form,
  FormGroup,
  FormSection,
  FormSelect,
  FormSelectOption,
  Button,
  Alert, 
  AlertActionCloseButton,
  Modal,
  Title,
  ExpandableSection,
  Grid,
  GridItem,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import ReactJson from 'react-json-view'

class GenericDecisionModelForm extends React.Component {
  constructor(props) {
    super(props);

    const kieSettings = loadFromLocalStorage('kieSettings', true);
    this.formRef = null; //AutoForm reference
    this.kieClient = new KieClient(kieSettings);

    this.state = {
      decisionEndpoints: [ { url: 'none', schema: { } } ],
      selectedDecisionEndpoint: { 
        url: '/',
        schema: { },
      },
      requestPayload: { },
      _apiCallStatus: 'NONE',
      _rawServerRequest: { },
      _rawServerResponse: { },
      _responseErrorAlertVisible: false,
      _responseModalOpen: false,
      _alert: {
        visible: false,
        variant: 'default',
        msg: '',
      },
      _isDebugExpanded: false,
      _renderForm: false,
    };
  }

  onFormSubmit = (data) => {
    this.setState({
      _apiCallStatus: 'WAITING',
      _responseModalOpen: true,      
    });

    // const rawServerRequest = data;
    const endpointPath = this.state.selectedDecisionEndpoint.url.replace('/server', '');

    this.kieClient
      .executeDecisionOpenApi(endpointPath, data)
      .then((response) => {
        console.debug('executeDecisionOpenApi.response: ', response)

        this.setState({
          _apiCallStatus: 'COMPLETE',
          _responseModalOpen: true,
          _rawServerResponse: response?.result ? response.result : response,
          _alert: {
            visible: false,
            variant: 'default',
            msg: '',
          },                    
        });

        // scroll the page to make alert visible
        this.scrollToTop();
      })
      .catch(err => {
        console.error(err);
        this.setState({
          _apiCallStatus: 'ERROR',
          _responseModalOpen: false,
          _rawServerResponse: err.response,
          _alert: {
            visible: true,
            variant: 'danger',
            msg: (err.status ? err.status : err) + '' + (err.response ? ': ' + err.response : ''),
          },
        })
        
        this.scrollToTop();
      })
      .finally(() => {
        // this.setState({
        //   _rawServerRequest: rawServerRequest,
        // })
      });

  };

  onInputChange = ({name, value}) => {

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
    // console.debug('handleSelectInputChange.value: ' + value);
    let renderForm = false;
    let selected = {url: 'none', schema: { } };
    if (value !== 'none') {
      selected = this.state.decisionEndpoints.find(e => e.url === value);
      renderForm = true;
    }

    // console.debug('handleSelectInputChange.selected: ', selected);
    this.setState({
      selectedDecisionEndpoint : selected,
      requestPayload : { },
      _rawServerRequest : { },
      _rawServerResponse : { },
      _renderForm: renderForm,
    });
    this.formRef && this.formRef.reset();

  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.debug('GenericDecisionModelForm ->>> componentDidUpdate...');
  }

  async componentDidMount() {
    console.debug('GenericDecisionModelForm ->>> componentDidMount...');
    const decisionEndpoints = await this.kieClient.getOpenApiDecisionEndpoints();
    // console.debug(decisionEndpoints);
    const filteredEndpoints = decisionEndpoints.filter(e => e.url.split('/').pop() === 'dmnresult');
    console.debug('filteredEndpoints: ', filteredEndpoints);
    this.setState({ decisionEndpoints : filteredEndpoints });
  }
  
  componentWillUnmount() {
    console.debug('GenericDecisionModelForm ->>> componentWillUnmount...');
  }

  closeResponseAlert = () => {
    this.setState({
      _alert: {
        visible: false,
        variant: 'default',
        msg: '',
      },
    });
  }
  
  updateState(formModelData) {
    this.setState({_rawServerRequest: formModelData});
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
  }

  createValidator(schema) {
    const ajv = new Ajv({ allErrors: true, useDefaults: true, strict: false });
    const validator = ajv.compile(schema);
  
    return (model) => {
      validator(model);
      return validator.errors?.length ? { details: validator.errors } : null;
    };
  }

  render() {
    const schemaValidator = this.createValidator(this.state.selectedDecisionEndpoint?.schema);
    const bridgeSchema = new JSONSchemaBridge(this.state.selectedDecisionEndpoint?.schema, schemaValidator);
    // console.debug('bridgeSchema ', bridgeSchema, this.state.selectedDecisionEndpoint);

    return (
      <Stack hasGutter>
        <StackItem>
          <React.Fragment>
            {
              this.state._alert.visible && (
                <Alert
                  variant={this.state._alert.variant}
                  autoFocus={true}
                  title={this.state._alert.msg}
                  action={<AlertActionCloseButton onClose={this.closeResponseAlert} />}
                />
              )
            }
            <Modal
              variant="small"
              title="Request submitted!"
              isOpen={this.state._responseModalOpen}
              onClose={this.handleModalToggle}
              actions={[
                <Button key="confirm" variant="primary" onClick={this.handleModalToggle}>
                  Confirm
                </Button>,
                <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
                  Cancel
                </Button>
              ]}
            >
              {this.state._apiCallStatus === 'WAITING' && (<Spinner isSVG />)}
              {this.state._apiCallStatus === 'COMPLETE' && (<ObjectAsCard obj={this.state._rawServerResponse} />)}
            </Modal>
          </React.Fragment>
          <Form>
            <FormSection>
              <FormGroup
                label="Decision Name"
                isRequired
                fieldId="decisionEndpoint">
                <FormSelect
                  id="decisionEndpoint" 
                  value={this.state.selectedDecisionEndpoint.url} 
                  onChange={this.handleSelectInputChange}
                  // validated={}
                  >
                  <FormSelectOption
                    isDisabled={false} 
                    key={0} 
                    value='none' 
                    label='>>> Select a Decision <<<'
                  />
                  {
                  this.state.decisionEndpoints.map((option, index) => { 
                    const arr = option.url.split('/');
                    return (
                      <FormSelectOption 
                        isDisabled={false} 
                        key={index+1}
                        value={option.url} 
                        label={arr[arr.length -2]} // get the name of the model
                      />
                      )}
                    )
                  }
                </FormSelect>
              </FormGroup>
            </FormSection>
          </Form>
        </StackItem>
        <StackItem isFilled>
          {/** Auto Form */}
          {this.state._renderForm && 
            (<AutoForm
              ref={ref => (this.formRef = ref)}
              placeholder={true}
              schema={bridgeSchema} 
              onChangeModel={model => this.updateState(model)} 
              onSubmit={this.onFormSubmit} >
            </AutoForm>)
          }
        </StackItem>
        <StackItem>
          <ExpandableSection toggleText="Debug View">
            <Grid hasGutter>
              <GridItem span={6}>
              <Title headingLevel="h6" size="md">Request Payload</Title>
                <ReactJson name={false} src={this.state._rawServerRequest} />
              </GridItem>
              <GridItem span={6}>
                <Title headingLevel="h6" size="md">Response Payload</Title>
                <ReactJson name={false} src={this.state._rawServerResponse} />
              </GridItem>
            </Grid>
          </ExpandableSection>
        </StackItem>
      </Stack>
    );
  }
}

export default GenericDecisionModelForm;