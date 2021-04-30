import "@patternfly/react-core/dist/styles/base.css";
import './fonts.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";

import React from 'react';
import {
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  Page,
  PageSection,
  PageSectionVariants,
  PageSidebar,
  TextContent,
  Text,
} from '@patternfly/react-core';
// make sure you've installed @patternfly/patternfly
import CarInsuranceForm from './carInsuranceForm'
import TrafficViolationForm from './trafficViolationForm'
import GenericDecisionModelForm from './genericDmnForm'
import SettingsForm from './settings'
import AppHeader from "./header";

class AppPagelayout extends React.Component {
  state = {
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    activeGroup: 'grp-1',
    activeItem: ''
  };

  onNavSelect = result => {
    this.setState({
      activeItem: result.itemId,
      activeGroup: result.groupId
    });
  };

  handleItemOnclick = (event, itemId, groupId) => {
    console.log(`menu item ${itemId} selected`);
  };

  render() {
    const { activeItem, activeGroup } = this.state;

    const PageNav = (
      <Nav onSelect={this.onNavSelect} aria-label="Nav" theme="dark">
        <NavList>
          <NavExpandable title="Decision Use Cases" groupId="grp-1" isActive={activeGroup === 'grp-1'} isExpanded>
            <NavItem groupId="grp-1" itemId="grp-1_itm-1" 
              isActive={activeItem === 'grp-1_itm-1'}
              onClick={this.handleItemOnclick}
              >
              <Link to="/carInsurance">Car Insurance</Link>
            </NavItem>
            <NavItem groupId="grp-1" itemId="grp-1_itm-2" 
              isActive={activeItem === 'grp-1_itm-2'}
              onClick={this.handleItemOnclick}
              >
              <Link to="/trafficViolation">Traffic Violation</Link>
            </NavItem>
            <NavItem groupId="grp-1" itemId="grp-1_itm-2" 
              isActive={activeItem === 'grp-1_itm-2'}
              onClick={this.handleItemOnclick}
              >
              <Link to="/genericDmn">Decision Models</Link>
            </NavItem>
          </NavExpandable>
        </NavList>
      </Nav>
    );

    const Sidebar = <PageSidebar nav={PageNav} theme="dark" />;
    const pageId = 'main-content-page-layout-expandable-nav';

    return (
      <Router>
        <Page
          header={<AppHeader />}
          sidebar={Sidebar}
          isManagedSidebar
          mainContainerId={pageId}
        >
              {/* A <Switch> looks through its children <Route>s and
                  renders the first one that matches the current URL. */}
              <Switch>
                <Route path="/carInsurance">
                  <PageSection variant={PageSectionVariants.light}>
                    <TextContent>
                      <Text component="h1">Insurance Application Form</Text>
                    </TextContent>
                  </PageSection>
                  <PageSection variant={PageSectionVariants.light}>
                    <CarInsuranceForm />
                  </PageSection>
                </Route>
                <Route path="/trafficViolation">
                  <PageSection variant={PageSectionVariants.light}>
                    <TextContent>
                      <Text component="h1">Traffic Violation</Text>
                    </TextContent>
                  </PageSection>
                  <PageSection variant={PageSectionVariants.light}>
                    <TrafficViolationForm />
                  </PageSection>
                </Route>                
                <Route path="/genericDmn">
                  <PageSection variant={PageSectionVariants.light}>
                    <TextContent>
                      <Text component="h1">Decision Models</Text>
                    </TextContent>
                  </PageSection>
                  <PageSection variant={PageSectionVariants.light}>
                    <GenericDecisionModelForm />
                  </PageSection>
                </Route>                
                <Route path="/settings">
                  <PageSection variant={PageSectionVariants.light}>
                    <TextContent>
                      <Text component="h1">Application Settings Form</Text>
                    </TextContent>
                  </PageSection>
                  <PageSection variant={PageSectionVariants.light}>
                    <SettingsForm />
                  </PageSection>
                </Route>                
                <Route path="/">
                  <PageSection variant={PageSectionVariants.light}>
                    <TextContent>
                      <Text component="h1">Welcome to Decision Manager Show Case app!</Text>
                    </TextContent>
                  </PageSection>
                </Route>
              </Switch>
        </Page>     
      </Router>         
    );
  }
}

export default AppPagelayout;