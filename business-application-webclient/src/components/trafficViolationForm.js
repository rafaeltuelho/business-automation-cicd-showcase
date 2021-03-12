import "@patternfly/react-core/dist/styles/base.css";
import isEmpty from 'validator/lib/isEmpty';

import KieClient from './kieClient';
import { formValidate } from './formValidation';
import { loadFromLocalStorage } from './util'
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
  TextContent,
  Title,
  TextList,
  TextListVariants,
  TextListItem,
  TextListItemVariants,
  ExpandableSection,
  Grid,
  GridItem,
  Spinner,
} from '@patternfly/react-core';
import ReactJson from 'react-json-view'

class TrafficViolationForm extends React.Component {
  constructor(props) {
    super(props);

    const kieSettings = loadFromLocalStorage('kieSettings', true);
    this.kieClient = new KieClient(kieSettings);

    this.state = {
      driver: {
        'name': '',
        'age': 0,
        'state': '',
        'city': '',
        'Points': 0,
      },
      violation: {
        'code': '',
        'date': null,
        'Type': 'NONE',
        'Speed Limit': 0,
        'Actual Speed': 0,
      },
      fieldsValidation: {
        driver: {
          'name': {
            valid: () => true, //!isEmpty(this.state.driver.name),
          },
          'age': {
            valid: () => true, //this.state.driver.age > 0,
          },
          'state': {
            valid: () => true, //this.state.driver.state,
          },
          'city': {
            valid: () => true, //this.state.driver.city,
          },
          'Points': {
            valid: () => true, //this.state.driver['Points'],
          },
        },
        violation: {
          'code': {
            valid: () => true, //this.state.violation.code,
          },
          'date': {
            valid: () => true, //this.state.violation.date,
          },
          'Type': {
            valid: () => this.state.violation['Type'],
          },
          'Speed Limit': {
            valid: () => this.state.violation['Speed Limit'],
          },
          'Actual Speed': {
            valid: () => this.state.violation['Actual Speed'],
          },
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

    const driverFact = this.state.driver;
    const violationFact = this.state.violation;
    const context = {'Driver': driverFact, 'Violation': violationFact};
    // build server request payload just for debug purposes
    const rawServerRequest = this.kieClient.buildDmnRequestBody(context);

    this.kieClient
      .executeDecision(context)
      .then((response) => {
        console.log(response)

        //parse DMN Results...
        let finalResult = null;
        let fine = null;
        let dmnResults = null;
        if (response?.result) {
          //TODO: instead of iterating over 'decision-results' try to get the results from 'dmn-context' using decision node name directly...
          dmnResults = response.result['dmn-evaluation-result']['decision-results'];
          Object.getOwnPropertyNames(dmnResults).forEach(p => {
            const result = dmnResults[p];
            if (result['decision-name'] === 'Should the driver be suspended?') {
              finalResult = result['result']; 
            }
            else if (result['decision-name'] === 'Fine') {
              fine = result['result'];
            }
          });          
        }
        else {
          finalResult = response['Should the driver be suspended?']; 
          fine = response['Fine'];
        }  
        this.setState({
          _apiCallStatus: 'COMPLETE',
          _responseModalOpen: true,
          _rawServerResponse: response?.result ? response.result : response,
          _serverResponse: {
            finalResult: finalResult,
            fine: fine,
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
    console.debug('TrafficViolationForm ->>> componentDidUpdate...');
  }

  componentDidMount() {
    console.debug('TrafficViolationForm ->>> componentDidMount...');
  }

  componentWillUnmount() {
    console.debug('TrafficViolationForm ->>> componentWillMount...');
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
    const violationTypes = [
      { value: 'NONE', label: 'Select a Violation Type', disabled: false },
      { value: 'speed', label: 'speed', disabled: false },
      { value: 'parking', label: 'parking', disabled: false },
      { value: 'driving under the influence', label: 'driving under the influence', disabled: false },
    ];

    const dateRegex = /(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/;

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

          <Modal
            variant="small"
            title="Violation submitted!"
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
              <TextContent>
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>Should the driver be suspended?</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.finalResult}</TextListItem>
                </TextList>
                <TextList component={TextListVariants.dl}>
                  <TextListItem component={TextListItemVariants.dt}>Fine Points</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.fine?.Points}</TextListItem>
                  <TextListItem component={TextListItemVariants.dt}>Fine Amount</TextListItem>
                  <TextListItem component={TextListItemVariants.dd}>{this.state._serverResponse.fine?.Amount}</TextListItem>
                </TextList>
              </TextContent>
            )}
          </Modal>        
        </React.Fragment>
        {/** Driver fields */}
        <FormGroup
          label="Driver Points"
          isRequired
          fieldId="driver.Points"
          helperText="Enter driver Points"
          helperTextInvalid="Points must not be empty">
          <TextInput
            isRequired
            type="number"
            id="driver.Points"
            validated={this.state.fieldsValidation.driver['Points'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
            value={this.state.driver['Points']}
            onChange={ this.handleTextInputChange } />
        </FormGroup>        

        <Divider />

        {/** Violation fields */}
        <FormSection>
          <FormGroup
            label="Violation Type"
            isRequired
            fieldId="violation.Type">
            <FormSelect
              id="violation.Type" 
              value={this.state.violation['Type']} 
              onChange={this.handleSelectInputChange}
              validated={this.state.fieldsValidation.violation['Type'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
              >
              {
              violationTypes.map((option, index) => (
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
          <FormGroup 
            label="Speed Limit" 
            isRequired 
            fieldId="violation.Speed Limit"
            helperText="Enter the speed limit "
            helperTextInvalid="Speed must be a valid number '1-220'">
            <TextInput
              isRequired
              type="number"
              id="violation.Speed Limit"
              placeholder="0-120"
              validated={this.state.fieldsValidation.violation['Speed Limit'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
              value={this.state.violation['Speed Limit']}
              onChange={ this.handleTextInputChange }
            />
          </FormGroup>
          <FormGroup 
            label="Actual Speed" 
            isRequired 
            fieldId="violation.Actual Speed"
            helperText="Enter your actual Speed "
            helperTextInvalid="Speed must be a valid number '1-220'">
            <TextInput
              isRequired
              type="number"
              id="violation.Actual Speed"
              placeholder="0-120"
              validated={this.state.fieldsValidation.violation['Actual Speed'].valid() ? ValidatedOptions.default : ValidatedOptions.error}
              value={this.state.violation['Actual Speed']}
              onChange={ this.handleTextInputChange }
            />
          </FormGroup>
        </FormSection>

        <ActionGroup>
          {/* <Button variant="primary" type="submit" onClick={this.onFormSubmit} isDisabled={!this.formValidate()}>Submit</Button> */}
          <Button variant="primary" type="submit" onClick={this.onFormSubmit} isDisabled={!formValidate(this.state.fieldsValidation)}>Submit</Button>
          <Button variant="secondary" type="reset">Cancel</Button>
        </ActionGroup>

        <ExpandableSection toggleText="Debug View">
          <Grid hasGutter>
          {/* <GridItem span={12}>{this.state.kieClient.settings.common.kieServerBaseUrl}</GridItem> */}
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
      </Form>      
    );
  }
}

export default TrafficViolationForm;