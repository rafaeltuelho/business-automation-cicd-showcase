import "@patternfly/react-core/dist/styles/base.css";
import isEmpty from 'validator/lib/isEmpty';
import KieClient from './kieClient';
import { formValidate } from './formValidation';
import './fonts.css';

import React from 'react';
import {
  Form,
  FormGroup,
  FormSection,
  TextInput,
  ValidatedOptions,
  FormSelectOption,
  FormSelect,
  ActionGroup,
  Button,
  Radio,
  Checkbox,
  Divider,
  ExpandableSection,
  Title,
  Alert, 
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { BorderNoneIcon } from '@patternfly/react-icons';
import { loadFromLocalStorage } from './util'

class SettingsForm extends React.Component {
  constructor(props) {
    super(props);

    const DEMO_KIE_SERVER_BASE_URL = 'http://localhost:8090/rest/server';
    const DEMO_KIE_SERVER_USER = 'kieserver';
    const DEMO_KIE_SERVER_PASSWORD = 'kieserver1!';
    const DEMO_CONTAINER_ID = 'decisions-showcase-1.0.0-SNAPSHOT';
    const DEMO_DMN_MODEL_NAMESPACE = 'https://github.com/kiegroup/drools/kie-dmn/_A4BCA8B8-CF08-433F-93B2-A2598F19ECFF';
    const DEMO_DMN_MODEL_NAME = 'Traffic Violation';

    const kieSettings = loadFromLocalStorage('kieSettings', true);
    this.state = {
      common: {
        kieServerBaseUrl: kieSettings?.common ? kieSettings.common.kieServerBaseUrl : DEMO_KIE_SERVER_BASE_URL,
        kieServerUser: kieSettings?.common ? kieSettings.common.kieServerUser : DEMO_KIE_SERVER_USER,
        kieServerPassword: kieSettings?.common ? kieSettings.common.kieServerPassword : DEMO_KIE_SERVER_PASSWORD,
      },
      jbpm: {
        containerId: kieSettings?.jbpm ? kieSettings.jbpm.containerId : '',
        processId: kieSettings?.jbpm ? kieSettings.jbpm.processId : '',
        kogitoRuntime: kieSettings?.jbpm ? kieSettings.jbpm.kogitoRuntime : false,
        endpointUrl: kieSettings?.jbpm ? kieSettings.jbpm.endpointUrl : '',
      },
      drools: {
        containerId: kieSettings?.drools ? kieSettings.drools.containerId : DEMO_CONTAINER_ID,
        kogitoRuntime: kieSettings?.drools ? kieSettings.drools.kogitoRuntime : false,
        endpointUrl: kieSettings?.drools ? kieSettings.drools.endpointUrl : '',
      },
      dmn: {
        containerId: kieSettings?.dmn ? kieSettings.dmn.containerId : DEMO_CONTAINER_ID,
        modelNamespace: kieSettings?.dmn ? kieSettings.dmn.modelNamespace : DEMO_DMN_MODEL_NAMESPACE,
        modelName: kieSettings?.dmn ? kieSettings.dmn.modelName : DEMO_DMN_MODEL_NAME,
        kogitoRuntime: kieSettings?.dmn?.kogitoRuntime ? kieSettings.dmn.kogitoRuntime : false,
        endpointUrl: kieSettings?.dmn ? kieSettings.dmn.endpointUrl : '',
      },
      fieldsValidation: {
        common: {
          kieServerBaseUrl:  {
            valid: () => !isEmpty(this.state.common.kieServerBaseUrl),
          },
          kieServerUser:  {
            valid: () => !isEmpty(this.state.common.kieServerUser),
          },
          kieServerPassword:  {
            valid: () => !isEmpty(this.state.common.kieServerPassword),
          },
        },      
        jbpm: {
          containerId: {
            valid: () => true, //!isEmpty(this.state.jbpm.containerId),
          },
          processId: {
            valid: () => true, //!isEmpty(this.state.jbpm.processId),
          },
        },
        drools: {
          containerId: {
            valid: () => !isEmpty(this.state.drools.containerId),
          },
        },
        dmn: {
          containerId: {
            valid: () => true, //!isEmpty(this.state.dmn.containerId),
          },
          modelNamespace: {
            valid: () => true, //!isEmpty(this.state.dmn.modelNamespace),
          },
          modelName: {
            valid: () => true, //!isEmpty(this.state.dmn.modelName),
          },
        }
      },
      _saveStatus: 'NONE',
      _rawServerResponse: {
      },
      _responseErrorAlertVisible: false,
      _responseModalOpen: false,
      _alert: {
        visible: false,
        variant: 'default',
        msg: '',
      },
    };
  }

  onSettingsSave = evt => {
    // evt.preventDefault();
    if (!formValidate(this.state.fieldsValidation)) return;

    const kieSettings = {
      common: this.state.common,
      jbpm: this.state.jbpm,
      drools: this.state.drools,
      dmn: this.state.dmn,
    };

    console.debug('saving kie settings into Brower\'s storage...', kieSettings);
    localStorage.setItem('kieSettings', JSON.stringify(kieSettings));
  };

  onTestConnection = evt => {
    // evt.preventDefault();
    if (!formValidate(this.state.fieldsValidation)) return;

    console.debug('testing kieserver connection');
    const kieSettings = {
      common: this.state.common,
      jbpm: this.state.jbpm,
      drools: this.state.drools,
      dmn: this.state.dmn,
    };

    this.kieClient = new KieClient(kieSettings);
    this.kieClient
    .testConnection()
      .then((response) => {
        this.setState({
          _alert: {
            visible: true,
            variant: 'success',
            msg: response?.type,
          },
        });
      })
      .catch((err) => {
        // console.error(err);
          this.setState({
          _saveStatus: 'ERROR',
          _rawServerResponse: err.response,
          _alert: {
            visible: true,
            variant: 'danger',
            msg: (err.status ? err.status : err) + '' + (err.response ? ': ' + err.response : ''),
          },
        })        
      })
      .finally(() => {
        this.scrollToTop();
      });
  };

  // common generic field Input Change Handler
  onInputChange = ({name, value}) => {
    const fieldObjectName = name.split('.')[0];
    const fieldPropertyName = name.split('.')[1];
    const objectState = Object.assign({}, this.state[fieldObjectName]);

    // console.debug('handleTextInputChange Handling: ' + name + ' value = ' + value);
    if ( Object.keys(objectState).find( (k, i, o) => k === fieldPropertyName) )
      objectState[fieldPropertyName] = value;

    this.setState( { [fieldObjectName]: objectState } );
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

  // handler for Checkbox fields
  handleCheckboxChange = (checked, event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.onInputChange({ name, value });
  };  

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.debug('SettingsForm ->>> componentDidUpdate...');
    if (prevState.dmn?.kogitoRuntime !== this.dmn?.kogitoRuntime) {
      // console.debug('---');
    }    
  }

  componentDidMount() {
    console.debug('SettingsForm ->>> componentDidMount...');
  }

  componentWillUnmount() {
    console.debug('SettingsForm ->>> componentWillMount...');
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

  scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  render() {
    return (
      <Form isHorizontal>
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

        </React.Fragment>
        {/** Common fields */}
        <FormSection>
          <FormGroup
            label="Kie Server Base URL"
            isRequired
            fieldId="common.kieServerBaseUrl"
            helperText="Enter the URL for the Kie Server"
            helperTextInvalid="URL must not be empty">
            <TextInput
              isRequired
              type="url"
              id="common.kieServerBaseUrl"
              validated={this.state.fieldsValidation.common['kieServerBaseUrl'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
              value={this.state.common.kieServerBaseUrl}
              onChange={ this.handleTextInputChange } />
          </FormGroup>
          <FormGroup
            label="Kie Server Username"
            isRequired
            fieldId="common.kieServerUser"
            helperText="Enter the Usernme for the Kie Server"
            helperTextInvalid="User must not be empty">
            <TextInput
              isRequired
              type="text"
              id="common.kieServerUser"
              validated={this.state.fieldsValidation.common['kieServerUser'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
              value={this.state.common.kieServerUser}
              onChange={ this.handleTextInputChange } />
          </FormGroup>
          <FormGroup
            label="Kie Server Password"
            isRequired
            fieldId="common.kieServerPassword"
            helperText="Enter the Password for the Kie Server"
            helperTextInvalid="Password must not be empty">
            <TextInput
              isRequired
              type="password"
              id="common.kieServerPassword"
              validated={this.state.fieldsValidation.common['kieServerPassword'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
              value={this.state.common.kieServerPassword}
              onChange={ this.handleTextInputChange } />
          </FormGroup>
        </FormSection>
        <ExpandableSection toggleText="Drools">
          <FormSection>
            <FormGroup
                label="Decision Kie Container Id"
                isRequired
                fieldId="drools.containerId"
                helperText="Enter the Container Id"
                helperTextInvalid="ContainerId must not be empty">
                <TextInput
                  isRequired
                  type="text"
                  id="drools.containerId"
                  validated={this.state.fieldsValidation.drools['containerId'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.drools.containerId}
                  onChange={ this.handleTextInputChange } />
            </FormGroup>          
          </FormSection>
        </ExpandableSection>
        <ExpandableSection toggleText="DMN">
          <FormSection>
            <FormGroup>
              <Checkbox
                label="Kogito Runtime?"
                isChecked={this.state.dmn.kogitoRuntime}
                onChange={this.handleCheckboxChange}
                aria-label="Kogito Runtime?"
                id="dmn.kogitoRuntime"
                name="dmn.kogitoRuntime"
              />              
            </FormGroup>
            <FormGroup
              label="Decision endpoint URL"
              // isRequired
              fieldId="dmn.endpointUrl"
              helperText="Enter the URL for Decision endpoint"
              helperTextInvalid="URL must not be empty">
              <TextInput
                isRequired
                type="url"
                id="dmn.endpointUrl"
                // validated={this.state.fieldsValidation.dmn['endpointUrl'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                isDisabled={!this.state.dmn.kogitoRuntime}
                value={this.state.dmn.endpointUrl}
                onChange={ this.handleTextInputChange } />
            </FormGroup>

            <FormGroup
                label="Decision Kie Container Id"
                // isRequired
                fieldId="dmn.containerId"
                helperText="Enter the Container Id"
                helperTextInvalid="ContainerId must not be empty">
                <TextInput
                  isRequired
                  type="text"
                  id="dmn.containerId"
                  isDisabled={this.state.dmn.kogitoRuntime}
                  validated={this.state.fieldsValidation.dmn['containerId'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.dmn.containerId}
                  onChange={ this.handleTextInputChange } />
            </FormGroup>          
            <FormGroup
                label="Model Namespace"
                // isRequired
                fieldId="dmn.modelNamespace"
                helperText="Enter the Model Namespace"
                helperTextInvalid="Namespace must not be empty">
                <TextInput
                  isRequired
                  type="text"
                  id="dmn.modelNamespace"
                  isDisabled={this.state.dmn.kogitoRuntime}
                  validated={this.state.fieldsValidation.dmn['modelNamespace'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.dmn.modelNamespace}
                  onChange={ this.handleTextInputChange } />
            </FormGroup>          
            <FormGroup
                label="Model Name"
                // isRequired
                fieldId="dmn.modelName"
                helperText="Enter the Model Name"
                helperTextInvalid="Model Name must not be empty">
                <TextInput
                  isRequired
                  type="text"
                  id="dmn.modelName"
                  isDisabled={this.state.dmn.kogitoRuntime}
                  validated={this.state.fieldsValidation.dmn['modelName'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.dmn.modelName}
                  onChange={ this.handleTextInputChange } />
            </FormGroup>          
          </FormSection>
        </ExpandableSection>
        <ExpandableSection toggleText="jBPM">
          <FormSection>
            <FormGroup
                label="Process Kie Continer Id"
                // isRequired
                fieldId="jbpm.containerId"
                helperText="Enter the Container Id"
                helperTextInvalid="ContainerId must not be empty">
                <TextInput
                  isRequired
                  type="text"
                  id="jbpm.containerId"
                  validated={this.state.fieldsValidation.jbpm['containerId'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.jbpm.containerId}
                  onChange={ this.handleTextInputChange } />
            </FormGroup>          
            <FormGroup
                label="Process Id"
                // isRequired
                fieldId="jbpm.processId"
                helperText="Enter the Process Id"
                helperTextInvalid="Process must not be empty">
                <TextInput
                  isRequired
                  type="text"
                  id="jbpm.processId"
                  validated={this.state.fieldsValidation.jbpm['processId'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.jbpm.processId}
                  onChange={ this.handleTextInputChange } />
            </FormGroup>          
          </FormSection>
        </ExpandableSection>

        <ActionGroup>
          <Button variant="primary" onClick={this.onSettingsSave} isDisabled={!formValidate(this.state.fieldsValidation)}>Save</Button>
          <Button variant="secondary" type="reset">Reset</Button>
          <Button variant="secondary" onClick={this.onTestConnection} isDisabled={!formValidate(this.state.fieldsValidation)}>Test Connection</Button>
        </ActionGroup>
      </Form>
    );
  }
}

export default SettingsForm;