import React from 'react';
import "@patternfly/react-core/dist/styles/base.css";

import "./App.css";

import AppPage from './components/page';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <AppPage>
        </AppPage>
      </React.Fragment>
    );
  }
}

export default App;