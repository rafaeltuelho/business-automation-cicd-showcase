import React from 'react';
import { Modal, ModalVariant, Button, Title, TitleSizes } from '@patternfly/react-core';
import WarningTriangleIcon from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';
import JSCodeEditor from './codeEditor';
import PlayIcon from '@patternfly/react-icons/dist/js/icons/play-icon';
import { Alert, AlertGroup, AlertActionCloseButton, AlertVariant, InputGroup } from '@patternfly/react-core';
class CodeEditorModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      alerts: [],
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };

    this.addAlert = (title, variant, key) => {
      this.setState({
        alerts: [ ...this.state.alerts, { title: title, variant: variant, key }]
      });
    };
    this.removeAlert = key => {
      this.setState({ alerts: [...this.state.alerts.filter(el => el.key !== key)] });
    };    
  }

  render() {
    const { isModalOpen } = this.state;

    const header = (
      <React.Fragment>
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
        <Title id="custom-header-label" headingLevel="h1" size={TitleSizes['2xl']}>
          Form JSON Schema Definition
        </Title>
        <p className="pf-u-pt-sm">
          This app uses the <strong><a href="https://uniforms.tools/" target="_blank">Uniforms</a></strong> ReactJS library to build dynamic forms based on JSON Schemas. 
          Uniforms supports different Schema definitions through its <a href="https://uniforms.tools/docs/api-bridges" target="_blank">Schema Bridge API</a>.
          <br /><br />
          This app uses the <a href='https://github.com/longshotlabs/simpl-schema' target='blank'>SimpleSchema</a> Bridge. 
          See the <a href="https://uniforms.tools/docs/tutorials-basic-uniforms-usage" target="_blank">Uniforms docs</a> for more details on how to define your schema. 
          Bellow you have the schema definition used for our demo scenario. Change it and hit the <PlayIcon /> icon to update the data input form.
        </p>
      </React.Fragment>
    );

    const footer = (
      <div>
        <Title headingLevel="h4" size={TitleSizes.md}>
          <WarningTriangleIcon />
          <span className="pf-u-pl-sm"> Click <PlayIcon /> icon and close the this modal window to update and reload the web Form!</span>
        </Title>     
      </div>
    );

    return (
      <React.Fragment>
        <Button variant="primary" onClick={this.handleModalToggle}>
          Define Data Input Schema (form)
        </Button>
        <Modal
          variant={ModalVariant.large}
          isOpen={isModalOpen}
          header={header}
          onClose={this.handleModalToggle}
          footer={footer}
        >
          <JSCodeEditor ancestorStateHandler={this.props.ancestorStateHandler} addAlertHandler={this.addAlert} removeAlertHandler={this.removeAlert} />
        </Modal>
      </React.Fragment>
    );
  }
}

export default CodeEditorModal;