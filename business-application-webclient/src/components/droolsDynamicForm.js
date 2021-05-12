import "@patternfly/react-core/dist/styles/base.css";
import isEmpty from 'validator/lib/isEmpty';

import KieClient from './kieClient';
import { formValidate } from './formValidation';
import { loadFromLocalStorage } from './util'
import { AutoForm } from 'uniforms-patternfly';
import Ajv from 'ajv';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import SimpleSchema from 'simpl-schema';
import { SimpleSchema2Bridge } from 'uniforms-bridge-simple-schema-2';
import ObjectAsCard from './objectCardRenderer'
import CodeEditorModal from './codeEditorModal';
import _ from 'lodash';
import './fonts.css';

import React from 'react';
import {
  Form,
  FormGroup,
  FormSection,
  FormSelectOption,
  FormSelect,
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

const RULES_KIE_SESSION_NAME='stateless-session';
const DEMO_SIMPLE_SCHEMA = new SimpleSchema2Bridge(
  new SimpleSchema({
    Driver: { type: Object, },
    'Driver.name': { type: String, min: 3, required: false},
    'Driver.age': { type: Number, min: 16, required: false},
    'Driver.claims': { type: SimpleSchema.Integer, min: 0 },
    'Driver.locationRiskProfile': { 
      type: String,
      defaultValue: 'Select',
      allowedValues: ['LOW', 'MEDIUM', 'HIGH'],
      uniforms: {
        options:
          [
            { label: 'Select', value: 'NONE' },
            { label: 'Low', value: 'LOW' },
            { label: 'Medium', value: 'MEDIUM' },
            { label: 'High', value: 'HIGH' },
          ]
      }
    },
    Policy: { type: Object, },
    'Policy.type': { 
      type: String,
      defaultValue: 'Select',
      allowedValues: ['COMPREHENSIVE', 'FIRE_THEFT', 'THIRD_PARTY'],
      uniforms: {
        options:
          [
            { label: 'Select', value: 'NONE' },
            { label: 'Comprehensive', value: 'COMPREHENSIVE' },
            { label: 'Fire Theft', value: 'FIRE_THEFT' },
            { label: '3rd Party', value: 'THIRD_PARTY' },
          ]
      }
    },
    // 'Policy.approved': { type: Boolean, },
    // 'Policy.discountPercent': { type: Number },
    // 'Policy.basePrice': { type: Number },
  })
);

class DroolsDynamicForm extends React.Component {
  constructor(props) {
    super(props);

    const kieSettings = loadFromLocalStorage('kieSettings', true);
    this.kieClient = new KieClient(kieSettings);
    this.formRef = null; //AutoForm reference

    this.state = {
      formBridgeSchema: DEMO_SIMPLE_SCHEMA,      
      _renderForm: true,
      _apiCallStatus: 'NONE',
      _rawServerRequest: { },
      _rawServerResponse: { },
      _serverResponse: { },
      _responseErrorAlertVisible: false,
      _responseModalOpen: false,
      _alert: {
        visible: false,
        variant: 'default',
        msg: '',
      },
      _isDebugExpanded: false,
    };
  }

  onFormSubmit = (data) => {
    this.setState({
      _apiCallStatus: 'WAITING',
      _responseModalOpen: true,      
    });

    // iterate over the AutoForm's model, extract each root Object as Fact
    let facts = [];
    _.map(data, (v, k, o) => {
      // console.debug('building drools fact for: ', k);
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
          _rawServerResponse: response,
          _serverResponse: this.kieClient.extractFactsFromKieResponse(response),
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
        // console.error(err);
        this.setState({
          _apiCallStatus: 'ERROR',
          _responseModalOpen: false,
          _rawServerResponse: {
            result: {},
          },
          _alert: {
            visible: true,
            variant: 'danger',
            msg: (err.status ? err.status : err) + '' + (err.response ? ': ' + err.response : ''),
          },
        })
        
        this.scrollToTop();
      })
      .finally(() => {
        this.setState({
          _rawServerRequest: rawServerRequest,
        })
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
    const { id } = event.currentTarget;
    this.onInputChange({ name: id, value });
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.debug('CarInsuranceForm ->>> componentDidUpdate...');
  }

  componentDidMount() {
    console.debug('CarInsuranceForm ->>> componentDidMount...');
  }

  componentWillUnmount() {
    console.debug('CarInsuranceForm ->>> componentWillMount...');
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

  updateState = (formModelData) => {
    this.setState({_rawServerRequest: formModelData});
  }

  handleFormSchemaState = (simpleSchema) => {
    if (this.formRef) {
      this.formRef.reset();
    }

    this.setState({
      formBridgeSchema: simpleSchema,
      _rawServerRequest: { },
      _rawServerResponse: { },
      _serverResponse: { },
    });
  }

  render() {

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
              {this.state._apiCallStatus === 'COMPLETE' && (<ObjectAsCard obj={this.state._serverResponse} />)}
            </Modal>
          </React.Fragment>
        </StackItem>
        <StackItem isFilled>
          <CodeEditorModal ancestorStateHandler={this.handleFormSchemaState} />
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
              <GridItem span={6}>
              <Title headingLevel="h6" size="md">Request Payload</Title>
                <ReactJson name={false} src={this.state._rawServerRequest}
                 onEdit={
                          e => {
                                console.log(e);
                                this.setState({ src: e.updated_src });
                            }
                  }
                  onDelete={
                          e => {
                                console.log(e);
                                this.setState({ src: e.updated_src });
                            }
                  }
                  onAdd={
                          e => {
                                console.log(e);
                                this.setState({ src: e.updated_src });
                            }
                  }
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
    );
  }
}

export default DroolsDynamicForm;