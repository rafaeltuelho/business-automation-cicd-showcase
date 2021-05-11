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
          With custom modal header/footer
        </Title>
        <p className="pf-u-pt-sm">Allows for custom content in the header and/or footer by passing components.</p>
      </React.Fragment>
    );

    const footer = (
      <Title headingLevel="h4" size={TitleSizes.md}>
        <WarningTriangleIcon />
        <span className="pf-u-pl-sm">Custom modal footer.</span>
      </Title>
    );

    return (
      <React.Fragment>
        <Button variant="primary" onClick={this.handleModalToggle}>
          Show Custom Header/Footer Modal
        </Button>
        <Modal
          variant={ModalVariant.large}
          isOpen={isModalOpen}
          header={header}
          aria-label="My dialog"
          aria-labelledby="custom-header-label"
          aria-describedby="custom-header-description"
          onClose={this.handleModalToggle}
          footer={footer}
        >
          <JSCodeEditor />
        </Modal>
      </React.Fragment>
    );
  }
}

export default CodeEditorModal;