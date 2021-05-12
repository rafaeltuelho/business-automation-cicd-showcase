import React from 'react';
import SimpleSchema from 'simpl-schema';
import { SimpleSchema2Bridge } from 'uniforms-bridge-simple-schema-2';
import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import PlayIcon from '@patternfly/react-icons/dist/js/icons/play-icon';

// FIXME: Make it extensible for globals.
const scope = typeof window === 'undefined' ? global : window;
// This is required for the eval.
scope.SimpleSchema = SimpleSchema;
scope.SimpleSchema2Bridge = SimpleSchema2Bridge;

const DEMO_JSON_SCHEMA = 
`new SimpleSchema2Bridge(
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
  }))`;

class JSCodeEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      code: DEMO_JSON_SCHEMA,
    };
    
    this.onChange = code => {
      this.setState({ code })
    };
    
    this.onExecuteCode = (code) => {
      console.debug('Applying JSON Schema... ', code);

      try {
        const simpleBridgeSchema = eval(`(${code})`);
        // console.debug('code parsed: ', simpleBridgeSchema);
        
        if (props.ancestorStateHandler) {
          console.info('calling ancestor state handler...');
          props.ancestorStateHandler(simpleBridgeSchema);

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
 
  render() {
    const customControl = (
      <CodeEditorControl 
        icon={<PlayIcon/>}
        aria-label="Update the Form Definition"
        toolTipText="Update the Form Definition"
        onClick={this.onExecuteCode}
        isVisible={true}
      />);
    
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
          height='400px'
          customControls={customControl}
          code={this.state.code}
          onChange={this.onChange}
        />
      </>
    );
  }
}

export default JSCodeEditor;