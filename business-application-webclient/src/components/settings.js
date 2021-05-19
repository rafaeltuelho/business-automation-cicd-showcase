import "@patternfly/react-core/dist/styles/base.css";
import isEmpty from 'validator/lib/isEmpty';
import KieClient from './kieClient';
import { formValidate } from './formValidation';
import _ from 'lodash';
import './fonts.css';

import React from 'react';
import {
  Form,
  FormGroup,
  FormSection,
  TextInput,
  Checkbox,
  ValidatedOptions,
  FormSelectOption,
  FormSelect,
  ActionGroup,
  Button,
  ExpandableSection,
  Alert, 
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { loadFromLocalStorage } from './util'

class SettingsForm extends React.Component {
  constructor(props) {
    super(props);

    const DEMO_KIE_SERVER_BASE_URL = 'http://localhost:8090/rest/server';
    const DEMO_KIE_SERVER_USER = 'kieserver';
    const DEMO_KIE_SERVER_PASSWORD = 'kieserver1!';
    const DEMO_CONTAINER_ID = 'decisions-showcase-1.0.0-SNAPSHOT';
    // const DEMO_DMN_MODEL_NAMESPACE = 'https://github.com/kiegroup/drools/kie-dmn/_A4BCA8B8-CF08-433F-93B2-A2598F19ECFF';
    // const DEMO_DMN_MODEL_NAME = 'Traffic Violation';

    const kieSettings = loadFromLocalStorage('kieSettings', true);
    
    // initialize the containers select list
    let savedKieContainers = [ {value: DEMO_CONTAINER_ID, label: DEMO_CONTAINER_ID, disabled: false} ];
    kieSettings.jbpm?.containerId && savedKieContainers.push({ value: kieSettings.jbpm.containerId, label: kieSettings.jbpm.containerId, disabled: false });
    kieSettings.drools?.containerId && savedKieContainers.push({ value: kieSettings.drools.containerId, label: kieSettings.drools.containerId, disabled: false });
    kieSettings.dmn?.containerId && savedKieContainers.push({ value: kieSettings.dmn.containerId, label: kieSettings.dmn.containerId, disabled: false });

    this.state = {
      common: {
        kieServerBaseUrl: kieSettings?.common?.kieServerBaseUrl ? kieSettings.common.kieServerBaseUrl : DEMO_KIE_SERVER_BASE_URL,
        kieServerUser: kieSettings?.common?.kieServerUser ? kieSettings.common.kieServerUser : DEMO_KIE_SERVER_USER,
        kieServerPassword: kieSettings?.common?.kieServerPassword ? kieSettings.common.kieServerPassword : DEMO_KIE_SERVER_PASSWORD,
      },
      jbpm: {
        containerId: kieSettings?.jbpm ? kieSettings.jbpm.containerId : undefined,
        processId: kieSettings?.jbpm ? kieSettings.jbpm.processId : undefined,
        kogitoRuntime: kieSettings?.jbpm ? kieSettings.jbpm.kogitoRuntime : false,
        endpointUrl: kieSettings?.jbpm ? kieSettings.jbpm.endpointUrl : undefined,
      },
      drools: {
        containerId: kieSettings?.drools?.containerId ? kieSettings.drools.containerId : DEMO_CONTAINER_ID,
        kieSessionName: (kieSettings?.drools?.kieSessionName && !_.isEmpty(kieSettings.drools.kieSessionName)) ? kieSettings.drools.kieSessionName : undefined,
        kogitoRuntime: kieSettings?.drools?.kogitoRuntime ? kieSettings.drools.kogitoRuntime : undefined,
        endpointUrl: kieSettings?.drools ? kieSettings.drools.endpointUrl : undefined,
      },
      dmn: {
        containerId: kieSettings?.dmn?.containerId ? kieSettings.dmn.containerId : DEMO_CONTAINER_ID,
        kogitoRuntime: kieSettings?.dmn?.kogitoRuntime ? kieSettings.dmn.kogitoRuntime : false,
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
            valid: () => this.state.jbpm.containerId !== 'NONE',
          },
          processId: {
            valid: () => true, //!isEmpty(this.state.jbpm.processId),
          },
        },
        drools: {
          containerId: {
            valid: () => this.state.drools.containerId !== 'NONE',
          },
          kieSessionName: {
            valid: () => true,
          },
        },
        dmn: {
          containerId: {
            valid: () => this.state.dmn.containerId !== 'NONE',
          },
        }
      },
      // TODO: create one array for jBPM, Drools and DMN
      kieContainers: _.uniqBy(savedKieContainers, 'value'),
      _saveStatus: 'NONE',
      _rawServerResponse: { },
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

    console.debug('saving kie settings into Browser\'s storage...', kieSettings);
    localStorage.setItem('kieSettings', JSON.stringify(kieSettings));
  };

  updateKieContainersList = (kieClient) => {
    kieClient.getKieContainers()
    .then((response) => {
      let containers = [];
      response.result['kie-containers']['kie-container']
        .filter(c => c['status'] === 'STARTED')
        .forEach(c => {
          containers.push({value: c['container-id'], label: c['container-id'], disabled: false});
        });

      this.setState({ kieContainers: containers, });
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
    });     
  }

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

    const kieClient = new KieClient(kieSettings);
    kieClient.testConnection()
      .then((response) => {

        // retrieve Kie Containers
        if (!this.state.dmn.kogitoRuntime && !this.state.drools.kogitoRuntime) {
          this.updateKieContainersList(kieClient);
        }

        this.setState({
          _alert: {
            visible: true,
            variant: 'success',
            msg: response?.type || ' Success!',
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
            helperText="Enter the Username for the Kie Server"
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
                helperText="Press Test Connection button to update the containers list..."
                helperTextInvalid="ContainerId must informed">
                
                <FormSelect
                  isRequired
                  isDisabled={this.state.drools.kogitoRuntime}
                  id="drools.containerId"
                  validated={this.state.fieldsValidation.drools['containerId'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.drools.containerId} 
                  onChange={this.handleSelectInputChange}>
                    <FormSelectOption key={-1} value='NONE' label='choose a kie container...' isPlaceholder={true} />
                    {this.state.kieContainers.map((option, index) => (
                      <FormSelectOption 
                      key={index} value={option.value} label={option.label} 
                      selected={option.value === this.state.drools.containerId}
                      />
                  ))}
                </FormSelect>
            </FormGroup>
            <FormGroup
                label="Kie Session Name"
                isRequired={false}
                fieldId="drools.kieSessionName"
                helperText="Enter the specific Session Name">
                <TextInput
                  isRequired={false}
                  type="text"
                  id="drools.kieSessionName"
                  validated={this.state.fieldsValidation.drools['kieSessionName'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.drools.kieSessionName}
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
                label="Decision Kie Container Id"
                // isRequired
                fieldId="dmn.containerId"
                helperText="Press Test Connection button to update the containers list..."
                helperTextInvalid="ContainerId must informed">
                
                <FormSelect
                  isRequired
                  isDisabled={this.state.dmn.kogitoRuntime}
                  id="dmn.containerId"
                  validated={this.state.fieldsValidation.dmn['containerId'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.dmn.containerId} 
                  onChange={this.handleSelectInputChange}>
                    <FormSelectOption key={-1} value='NONE' label='choose a kie container...' isPlaceholder={true} />
                    {this.state.kieContainers.map((option, index) => (
                      <FormSelectOption 
                        key={index} value={option.value} label={option.label} 
                        selected={option.value === this.state.dmn.containerId} />
                    ))}
                </FormSelect>
            </FormGroup>
          </FormSection>
        </ExpandableSection>
        <ExpandableSection toggleText="jBPM">
          <FormSection>
            <FormGroup
                label="Process Kie Continer Id"
                // isRequired
                fieldId="jbpm.containerId"
                helperText="Press Test Connection button to update the containers list..."
                helperTextInvalid="ContainerId must informed">
                
                <FormSelect
                  isRequired
                  // isDisabled={this.state.kieContainers.length === 0}
                  id="jbpm.containerId"
                  validated={this.state.fieldsValidation.jbpm['containerId'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
                  value={this.state.jbpm.containerId} 
                  onChange={this.handleSelectInputChange}>
                    <FormSelectOption key={-1} value='NONE' label='choose a kie container...' isPlaceholder={true} />
                    {this.state.kieContainers.map((option, index) => (
                      <FormSelectOption 
                      key={index} value={option.value} label={option.label} 
                      selected={option.value === this.state.jbpm.containerId} />
                  ))}
                </FormSelect>
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