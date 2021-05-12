import React from 'react';
import { Modal, ModalVariant, Button, Title, TitleSizes } from '@patternfly/react-core';
import WarningTriangleIcon from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';
import JSCodeEditor from './codeEditor';

class CodeEditorModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false
    };
    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };
  }

  render() {
    const { isModalOpen } = this.state;

    const header = (
      <React.Fragment>
        <Title id="custom-header-label" headingLevel="h1" size={TitleSizes['2xl']}>
          Form JSON Schema Definition
        </Title>
        <p className="pf-u-pt-sm">Define your JSON Schema using <a href='https://github.com/longshotlabs/simpl-schema' target='blank'>SimpleSchema</a></p>
      </React.Fragment>
    );

    const footer = (
      <Title headingLevel="h4" size={TitleSizes.md}>
        <WarningTriangleIcon />
        <span className="pf-u-pl-sm">Save to reload the web Form</span>
      </Title>
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
          <JSCodeEditor ancestorStateHandler={this.props.ancestorStateHandler} />
        </Modal>
      </React.Fragment>
    );
  }
}

export default CodeEditorModal;