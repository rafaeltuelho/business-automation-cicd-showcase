import React from 'react';
import SimpleSchema from 'simpl-schema';
import { SimpleSchema2Bridge } from 'uniforms-bridge-simple-schema-2';
import { DEMO_SIMPLE_SCHEMA_CODE, DEMO_SIMPLE_SCHEMA_MORTGAGE_CODE, DEMO_SIMPLE_SCHEMA_QLB_CODE } from './demoFormSchema';
import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import PlayIcon from '@patternfly/react-icons/dist/js/icons/play-icon';
import BlueprintIcon from '@patternfly/react-icons/dist/js/icons/blueprint-icon';


// FIXME: Make it extensible for globals.
const scope = typeof window === 'undefined' ? global : window;
// This is required for the eval.
scope.SimpleSchema = SimpleSchema;
scope.SimpleSchema2Bridge = SimpleSchema2Bridge;

class JSCodeEditor extends React.Component {
  constructor(props) {
    super(props);

    console.debug('JSCodeEditor.props.code: ', props.code);

    this.state = {
      code: props.code,
    };
    
    this.onChange = code => {
      this.setState({ code })
    };

    this.onDemoCode = () => {
      this.setState({ code: DEMO_SIMPLE_SCHEMA_CODE })
    };

    this.onMortgageDemoCode = () => {
      this.setState({ code: DEMO_SIMPLE_SCHEMA_MORTGAGE_CODE })
    };

    this.onQLBDemoCode = () => {
      this.setState({ code: DEMO_SIMPLE_SCHEMA_QLB_CODE })
    };
    
    this.onExecuteCode = (code) => {
      try {
        const simpleBridgeSchema = eval(`(${code})`);
        // console.debug('code parsed: ', simpleBridgeSchema);        
        if (props.ancestorStateHandler) {
          console.info('calling ancestor state handler...');
          props.ancestorStateHandler(simpleBridgeSchema, code);

          if (props.addAlertHandler) {
            props.addAlertHandler('Form schema updated. Close the code editor to see the form updated!', 'success', new Date().getTime());
          }
        }
      } catch (error) {
        console.error(error);
        if (props.addAlertHandler) {
          props.addAlertHandler('Schema Validation Failed:' + error, 'danger', new Date().getTime());
        }
      }
    };
  }
 
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.debug('CodeEditor ->>> componentDidUpdate...');
  }

  componentDidMount() {
    console.debug('CodeEditor ->>> componentDidMount...');
  }

  componentWillUnmount() {
    console.debug('CodeEditor ->>> componentWillUnmount...');
  }

  render() {
    const customControlApplyCode = (
        <CodeEditorControl 
          icon={<PlayIcon/>}
          aria-label="Update the Form Definition"
          toolTipText="Update the Form Definition"
          onClick={this.onExecuteCode}
          isVisible={true}
        />
      );
    const customControlLoadDemoCode = (
      <CodeEditorControl 
        icon={<BlueprintIcon/>}
        aria-label="Load Policy/Driver demo code"
        toolTipText="Load Policy/Driver demo code"
        onClick={this.onDemoCode}
        isVisible={true}
      />
    );
    const customControlLoadMortgageDemoCode = (
      <CodeEditorControl 
        icon={<BlueprintIcon/>}
        aria-label="Load Mortgage demo code"
        toolTipText="Load Mortgage demo code"
        onClick={this.onMortgageDemoCode}
        isVisible={true}
      />
    );
    const customControlLoadQLBDemoCode = (
      <CodeEditorControl 
        icon={<BlueprintIcon/>}
        aria-label="Load QLB demo code"
        toolTipText="Load QLB demo code"
        onClick={this.onQLBDemoCode}
        isVisible={true}
      />
    );
    
    return (
      <>
        <CodeEditor
          isDownloadEnabled
          isCopyEnabled
          isDarkTheme={false}
          isLineNumbersVisible
          isReadOnly={false}
          isLanguageLabelVisible
          language={Language.javascript}
          height='600px'
          customControls={[customControlApplyCode, customControlLoadDemoCode, customControlLoadMortgageDemoCode, customControlLoadQLBDemoCode]}
          code={this.state.code}
          onChange={this.onChange}
        />
      </>
    );
  }
}

export default JSCodeEditor;