import "@patternfly/react-core/dist/styles/base.css";
import isEmpty from 'validator/lib/isEmpty';

import KieClient from './kieClient';
import { formValidate } from './formValidation';
import { loadFromLocalStorage } from './util'
import ObjectAsCard  from './objectCardRenderer'
import _ from 'lodash';
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
  Divider,
  Alert, 
  AlertActionCloseButton,
  Modal,
  Title,
  ExpandableSection,
  Grid,
  GridItem,
  Spinner,
} from '@patternfly/react-core';
import ReactJson from 'react-json-view'

const RULES_KIE_SESSION_NAME='stateless-session';
const DRIVER_FACT_FQDN='com.redhat.demos.decisiontable.Driver';
const POLICY_FACT_FQDN='com.redhat.demos.decisiontable.Policy';

class CarInsuranceForm extends React.Component {
  constructor(props) {
    super(props);

    const kieSettings = loadFromLocalStorage('kieSettings', true);
    this.kieClient = new KieClient(kieSettings);

    this.state = {
      driver: {
        name: '',
        age: 0,
        priorClaims: 0,
        locationRiskProfile: 'NONE',
      },
      policy: {
        type: 'NONE',
        approved: false,
        discountPercent: 0,
        basePrice: 0.0,
      },
      fieldsValidation: {
        driver: {
          name: {
            valid: () => !isEmpty(this.state.driver.name),
          },
          age: {
            valid: () => this.state.driver.age > 0,
          },
          priorClaims: {
            valid: () => this.state.driver.priorClaims >= 0 && this.state.driver.priorClaims <= 100,
          },
          locationRiskProfile: {
            valid: () => this.state.driver.locationRiskProfile !== 'NONE',
          },
        },
        policy: {
          type: {
            valid: () => this.state.policy.type !== 'NONE',
          }
        }
      },
      _apiCallStatus: 'NONE',
      _rawServerRequest: {},
      _rawServerResponse: {},
      _serverResponse: {
        driverFact: { },
        policyFact: { },
      },
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

  onFormSubmit = evt => {
    evt.preventDefault();

    this.setState({
      _apiCallStatus: 'WAITING',
      _responseModalOpen: true,      
    });

    // if (!this.formValidate()) return;
    if (!formValidate(this.state.fieldsValidation)) return;

    const driverFact = this.kieClient.newInsertCommand({ [DRIVER_FACT_FQDN]: this.state.driver }, 'driver', true);
    const policyFact = this.kieClient.newInsertCommand({ [POLICY_FACT_FQDN]: this.state.policy }, 'policy', true);
    const facts = [driverFact, policyFact];
    // build server request payload just for debug purposes
    const rawServerRequest = this.kieClient.buildDroolsRequestBody(facts, RULES_KIE_SESSION_NAME);

    this.kieClient
      .fireRules(facts)
      .then((response) => {

        const driverFact = this.kieClient.extractFactFromKieResponse(response, 'driver');
        const policyFact = this.kieClient.extractFactFromKieResponse(response, 'policy');

        this.setState({
          _apiCallStatus: 'COMPLETE',
          _responseModalOpen: true,
          _rawServerResponse: response,
          _serverResponse: {
            driverFact,
            policyFact,
          },
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
    const fieldObjectName = name.split('.')[0];
    const fieldPropertyName = name.split('.')[1];
    const objectState = Object.assign({}, this.state[fieldObjectName]);
    const fieldsValidation = Object.assign({}, this.state.fieldsValidation);

    // console.debug('handleTextInputChange Handling: ' + name + ' value = ' + value);
    if (Object.keys(objectState).find( (k, i, o) => k === fieldPropertyName )) {
      objectState[fieldPropertyName] = value;
    }

    this.setState({ 
      [fieldObjectName]: objectState,
      fieldsValidation
    });
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

  render() {
    const isExpanded = this.state._isDebugExpanded;
    const insuranceTypes = [
      { value: 'NONE', label: 'Select an Insurance Type', disabled: false },
      { value: 'COMPREHENSIVE', label: 'Comprehensive', disabled: false },
      { value: 'FIRE_THEFT', label: 'Fire and Theft', disabled: false },
      { value: 'THIRD_PARTY', label: '3rd Party', disabled: false },
    ];
    const pricingBracket = [
      { value: 'NONE', label: 'Select Pricing Bracket', disabled: false },
      { value: 'LOW', label: 'Low', disabled: false },
      { value: 'MED', label: 'Medium', disabled: false },
      { value: 'HIGH', label: 'High', disabled: false },
    ];
    const locationRisk = [
      { value: 'NONE', label: 'Select Location Risk', disabled: false },
      { value: 'LOW', label: 'Low', disabled: false },
      { value: 'MED', label: 'Medium', disabled: false },
      { value: 'HIGH', label: 'High', disabled: false },
    ];

    const dateRegex = /(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/;

    return (
      <Form isHorizontal>
        <React.Fragment>
          {/**/
          this.state._alert.visible && (
            <Alert
              variant={this.state._alert.variant}
              autoFocus={true}
              title={this.state._alert.msg}
              action={<AlertActionCloseButton onClose={this.closeResponseAlert} />}
            />
          )
          /**/}

          <Modal
            variant="small"
            title="Application submitted!"
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
            {this.state._apiCallStatus === 'COMPLETE' && (
              

              <ObjectAsCard obj={this.state._serverResponse} />
            )}
          </Modal>        
        </React.Fragment>
        {/** Driver fields */}
        <FormGroup
          label="Driver Name"
          isRequired
          fieldId="driver.name"
          helperText="Enter your Name"
          helperTextInvalid="Name must not be empty">
          <TextInput
            isRequired
            type="text"
            id="driver.name"
            validated={this.state.fieldsValidation.driver['name'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
            value={this.state.driver.name}
            onChange={ this.handleTextInputChange } />
        </FormGroup>        
        <FormGroup 
          label="Age" 
          isRequired 
          fieldId="driver.age"
          helperText="Enter your Age "
          helperTextInvalid="Age must be a valid number '1-120'">
          <TextInput
            isRequired
            type="number"
            id="driver.age"
            placeholder="0-120"
            validated={this.state.fieldsValidation.driver['age'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
            value={this.state.driver.age}
            onChange={ this.handleTextInputChange }
          />
        </FormGroup>
        <FormGroup 
          label="Prior Claims" 
          isRequired 
          fieldId="driver.priorClaims"
          helperText="Enter # of prior claims "
          helperTextInvalid="must be a valid number '1-100'">
          <TextInput
            isRequired
            type="number"
            id="driver.priorClaims"
            placeholder="0-100"
            validated={this.state.fieldsValidation.driver['priorClaims'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
            value={this.state.driver.priorClaims}
            onChange={ this.handleTextInputChange }
          />
        </FormGroup>
        <FormGroup
          label="Location Risk Profile"
          isRequired
          fieldId="driver.locationRiskProfile">
          <FormSelect
            id="driver.locationRiskProfile" 
            value={this.state.driver.locationRiskProfile} 
            onChange={this.handleSelectInputChange}
            validated={this.state.fieldsValidation.driver['locationRiskProfile'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
            >
            {
            locationRisk.map((option, index) => (
                <FormSelectOption 
                  isDisabled={option.disabled} 
                  key={index} 
                  value={option.value} 
                  label={option.label} 
                />
              ))
            }
          </FormSelect>
        </FormGroup>

        <Divider />

        {/** Policy fields */}
        <FormSection>
          <FormGroup
            label="Policy Type"
            isRequired
            fieldId="policy.type">
            <FormSelect
              id="policy.type" 
              value={this.state.policy.type} 
              onChange={this.handleSelectInputChange}
              validated={this.state.fieldsValidation.policy['type'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
              >
              {
              insuranceTypes.map((option, index) => (
                  <FormSelectOption 
                    isDisabled={option.disabled} 
                    key={index} 
                    value={option.value} 
                    label={option.label} 
                  />
                ))
              }
            </FormSelect>
          </FormGroup>
        </FormSection>

        <ActionGroup>
          {/* <Button variant="primary" type="submit" onClick={this.onFormSubmit} isDisabled={!this.formValidate()}>Submit</Button> */}
          <Button variant="primary" type="submit" onClick={this.onFormSubmit} isDisabled={!formValidate(this.state.fieldsValidation)}>Submit</Button>
          <Button variant="secondary" type="reset">Cancel</Button>
        </ActionGroup>

        <ExpandableSection toggleText="Debug View">
          <Grid hasGutter>
            <GridItem span={6}>
            <Title headingLevel="h6" size="md">Request Payload</Title>
              <ReactJson name={false} src={this.state._rawServerRequest} />
            </GridItem>
            <GridItem span={4}>
              <Title headingLevel="h6" size="md">Response Payload</Title>
              <ReactJson name={false} src={this.state._rawServerResponse.result} />
            </GridItem>
          </Grid>
        </ExpandableSection>    
      </Form>      
    );
  }
}

export default CarInsuranceForm;