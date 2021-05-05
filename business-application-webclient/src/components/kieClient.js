import fetch from 'isomorphic-fetch';
import { getReasonPhrase } from 'http-status-codes' 
import SwaggerClient from "swagger-client";

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

  getKieContainers() {
    console.log('\n\n--------------------------------');
    console.log('retrieving deployment units (kie containers) from the connected kie server [' + 
                  this.settings.common.kieServerBaseUrl + ']...');

    const url = this.settings.common.kieServerBaseUrl + '/containers';
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

  buildDroolsRequestBody(facts, kieSessionName = KIE_SESSION_NAME) {
    console.debug('kieSessionName: ', kieSessionName);
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
    const endpoint =
        this.settings.common.kieServerBaseUrl + '/containers/instances/' + 
        this.settings.drools.containerId;
    const payload = this.buildDroolsRequestBody(facts, this.settings.drools.kieSessionName);
    return this.callKieServer(endpoint, payload); 
  }

  executeDecision(context) {
    const endpoint = this.settings.dmn.kogitoRuntime ?
        this.settings.dmn.endpointUrl :
          this.settings.common.kieServerBaseUrl + '/containers/' + this.settings.dmn.containerId + '/dmn';
    const payload = this.buildDmnRequestBody(context);
    return this.callKieServer(endpoint, payload); 
  }

  executeDecisionOpenApi(endpointPath, payload) {
    const endpointUrl = this.settings.common.kieServerBaseUrl + endpointPath;
    return this.callKieServer(endpointUrl, payload); 
  }

  // OpenAPI client functions
  async getOpenApiDecisionEndpoints() {
    const openApiURL = 
      this.settings.common.kieServerBaseUrl + '/containers/' + 
      this.settings.dmn.containerId + '/dmn/openapi.json';
    const api = await SwaggerClient.resolve({url: openApiURL});

    let endpoints = [];
    const paths = api.spec.paths;
    for (const url in paths) {
      try {
        const schema = paths[url]["post"]["requestBody"]["content"]["application/json"]["schema"];
        console.debug("Endpoint & Schema: ", url, schema);

        if (schema != null) {
          const patchedSchema = this.patchSchema(schema);
          endpoints.push({url : url, schema : patchedSchema}); //schema
        }
      } catch (err) {
        console.warn("the path url does not define any post for json, compatible with this app.");
        console.debug(err);
        const error = new Error(`HTTP Error [${err}]`);
        throw error;            
      }
    }

    return endpoints;
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
        // we're interest in the enclosing object which represents the Fact Type structure
        return Object.entries(factWrapper.value)[0][1];
    } else {
        const error = new Error(`Fact Object with identifier ${factId} not found on response`);
        error.status = 'FACT NOT FOUND';
        error.response = `Fact Object with identifier ${factId} not found on response`;
        console.debug(error);
        throw error;        
    }
  }

  extractFactsFromKieResponse(serverResponse) {
    let facts = [];
    if (serverResponse.result) {
        serverResponse.result['execution-results'].results.forEach(f => {
          facts.push(f); // {key: x, value: y}
        });

        return facts;
    } else {
        const error = new Error(`Fact results not found on response`);
        error.status = 'FACT NOT FOUND';
        error.response = 'Fact results not found on response';
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

  patchSchema(originalSchema) {
    const obj = originalSchema;
    let clone = Object.assign({}, obj);
    if (obj['properties']) {
      Object.getOwnPropertyNames(obj['properties']).forEach(p => {
        const childProp = obj['properties'][p];
        console.debug('patchSchema() \n\t traversing obj property [' + p + ']');
        
        if (childProp instanceof Object) {
          if (childProp['properties']) { //deep/recursive
            clone['properties'][p] = this.patchSchema(childProp);
          }
          // else if (Object.hasOwnProperty.call(childProp, 'format') && childProp['format'] === 'date') { //fix date format
          //   console.debug('prop with date format detected: ', childProp);
          //   clone['properties'][p]['format'] = 'date-time';
          // }
          else if (Object.hasOwnProperty.call(childProp, 'format')) { //fix date format
            if (childProp['format'] === 'days and time duration' || childProp['format'] === 'years and months duration') {
              console.debug('prop DMN duration format detected: ', childProp);
              clone['properties'][p]['format'] = 'duration';
              clone['properties'][p]['type'] = 'string';
            }
          }
          else if (!Object.hasOwnProperty.call(childProp, 'type')) { //fix props with no type defined
            console.debug('prop with no type detected: ', childProp);
            clone['properties'][p]['type'] = 'string';
          }
          else if (Object.hasOwnProperty.call(childProp, 'enum')) { //fix props with no type defined
            console.debug('prop with enum type detected: ', childProp);
            clone['properties'][p]['placeholder'] = '>>> Select <<<';
          }
          // Set the title prop as the same name as the property key
          clone['properties'][p]['title'] = p;
        }
      });
    }
    //console.debug('patchSchema().patched: ', clone);
    return clone;
  }

}