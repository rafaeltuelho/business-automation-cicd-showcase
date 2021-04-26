import fetch from 'isomorphic-fetch';
import { getReasonPhrase } from 'http-status-codes' 

// EAP runtime
//const KIE_SERVER_API_BASE_URL='http://localhost:8080/kie-server/services/rest/server';
// Spring Boot runtime
const KIE_SERVER_API_BASE_URL='http://localhost:8090/rest/server';
const KIE_SERVER_CLIENT_USER='kieserver';
const KIE_SERVER_CLIENT_PWD='kieserver1!';
// const KIE_SERVER_AUTH_BASE64=btoa(KIE_SERVER_CLIENT_USER + ':' + KIE_SERVER_CLIENT_PWD);
const KIE_SESSION_NAME = 'default';

/**
 * Client for the Remote KIE Sever API
 */
export default class KieClient {
  constructor(props) {
    
    this.settings = {
      common: {
        kieServerBaseUrl: props?.common?.kieServerBaseUrl ? props.common.kieServerBaseUrl : KIE_SERVER_API_BASE_URL,
        kieServerUser: props?.common?.kieServerUser ? props.common.kieServerUser : KIE_SERVER_CLIENT_USER,
        kieServerPassword: props?.common?.kieServerPassword ? props.common.kieServerPassword : KIE_SERVER_CLIENT_PWD,
        kieServerAuthBase64: btoa(props?.common?.kieServerUser + ':' + props?.common?.kieServerPassword),
      },
      jbpm: {
        containerId: props?.jbpm?.containerId,
        processId: props?.jbpm?.processId,
      },
      drools: {
        containerId: props?.drools?.containerId,
        kieSessionName: props?.drools?.kieSessionName ? props.drools.kieSessionName : KIE_SESSION_NAME,
      },
      dmn: {
        containerId: props?.dmn?.containerId,
        modelNamespace: props?.dmn?.modelNamespace,
        modelName: props?.dmn?.modelName,
        kogitoRuntime: props?.dmn?.kogitoRuntime ? props.dmn.kogitoRuntime : false,
        endpointUrl: props?.dmn ? props.dmn.endpointUrl : '',
      }
    };

    console.debug('KieClient initialized!', this.settings);
  }

  buildDroolsRequestBody(facts, kieSessionName) {
    const requestBody = {
      "lookup": kieSessionName,
      "commands": [
          ...facts,
          {
              "fire-all-rules": {
                "max": -1,
                "out-identifier": "rules fired"                  
              }
          }
      ]
    }

    return requestBody;
  }

  buildDmnRequestBody(context) {
    let requestBody = {};
    if (this.settings.dmn.kogitoRuntime) {
      requestBody = context;
    }
    else {
      requestBody = {
        "model-namespace": this.settings.dmn.modelNamespace,
        "model-name": this.settings.dmn.modelName,
        // "decision-name":[],
        // "decision-id": [],
        "dmn-context" : context,      
      }
    }

    return requestBody;
  }

  // kie API call functions
  fireRules(facts) {
    const endpoint = (
        this.settings.common.kieServerBaseUrl + '/containers/instances/' + this.settings.drools.containerId
    );
    const payload = this.buildDroolsRequestBody(facts);
    return this.callKieServer(endpoint, payload); 
  }

  executeDecision(context) {
    const endpoint = this.settings.dmn.kogitoRuntime ?
        this.settings.dmn.endpointUrl :
          this.settings.common.kieServerBaseUrl + '/containers/' + this.settings.drools.containerId + '/dmn';
    const payload = this.buildDmnRequestBody(context);
    return this.callKieServer(endpoint, payload); 
  }

  // helper functions
  callKieServer(endpoint, payload) {
    console.log('\n\n--------------------------------');
    console.log('calling kie server endpoint: ' + endpoint);

    console.debug('body payload:\n', JSON.stringify(payload, null, '  '));
    console.log('--------------------------------\n\n')

    return fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization':'Basic ' + this.settings.common.kieServerAuthBase64,
        },
        body: JSON.stringify(payload),
      }).then(this.checkHttpStatus)
          .then(this.parseJson)
            .then(this.checkKieResponse)
            .catch(err => {
              console.debug(err);
              const error = new Error(`HTTP Error [${err}]`);
              throw error;          
            }); 
  }

  testConnection() {
    console.log('\n\n--------------------------------');
    console.log('calling kie server...');

    const url = this.settings.common.kieServerBaseUrl;
    return fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization':'Basic ' + this.settings.common.kieServerAuthBase64,
        },
      }).then(this.checkHttpStatus)
          .then(this.parseJson)
            .then(this.checkKieResponse);
  }

  newInsertCommand(fact, factId, shouldReturn) {
    const obj = {
        "insert": {
            "object": fact,
            "out-identifier": factId,
            "return-object": shouldReturn,
        },
        // force an error on kie-server
        // "out-identifier": factId,
        // "return-object": shouldReturn,
    };
    //console.debug(JSON.stringify(obj, null, '\t'));
    return obj;
  }
  
  extractFactFromKieResponse(serverResponse, factId) {
    let factWrapper = null;
    if (serverResponse.result)
        factWrapper = serverResponse.result['execution-results'].results.find( o => o.key === factId );

    if(factWrapper){
        // as the wrapper object has only one property which is the FQDN for the Fact Class Type
        // we'are interest in the enclosing object which represents the Fact Type structure
        return Object.entries(factWrapper.value)[0][1];
    } else {
        const error = new Error(`Fact Object with identifier ${factId} not found on response`);
        error.status = 'FACT NOT FOUND';
        error.response = `Fact Object with identifier ${factId} not found on response`;
        console.debug(error);
        throw error;        
    }
  }
  
  checkHttpStatus(response) {
    console.debug('Response from api server: \n', JSON.stringify(response, null, '  '));
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
      const error = new Error(`HTTP Error ${response.status}:${response.statusText}`);
      error.status = response.status + '(' +  getReasonPhrase(response.status) + '):' + response.statusText;
      error.response = response;
      console.debug(error);
      throw error;
    }
  }

  checkKieResponse(response) {
    console.debug('Response from KIE api server: \n', JSON.stringify(response, null, '  '));
    if (response.type && response.result) { // standard Kie Server (non Kogito)
      if (response.type === 'FAILURE') {
        const error = new Error(`KIE API Error ${response.msg}`);
        error.status = response.type;
        error.response = response.msg;
        console.debug(error);
        throw error;
      }
    }

    return response;
  }

  parseJson(response) {
    return response.json();
  }
}