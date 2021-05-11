import React from 'react';
import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import PlayIcon from '@patternfly/react-icons/dist/js/icons/play-icon';

class JSCodeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: ''
    };
    
    this.onChange = code => {
      this.setState({ code })
    };
    
    this.onExecuteCode = (code) => {
      console.log(code);
    };
  }
 
  render() {
    const customControl = (
      <CodeEditorControl 
        icon={<PlayIcon/>}
        aria-label="Execute code"
        toolTipText="Execute code"
        onClick={this.onExecuteCode}
        isVisible={true}
      />);
    
    return (
      <>
        <CodeEditor
          isDownloadEnabled
          isCopyEnabled
          isDarkTheme
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