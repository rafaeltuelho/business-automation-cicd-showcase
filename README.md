# Red Hat Business Automation CI/CD Showcase

Check how you can use OpenShift Pipelines (a.k.a Tekton) to automate the delivery of decision services implemented with Red Hat PAM (a.k.a. jBPM). In this showcase you can see:

* The automation of repeatable decisions using the [DMN](https://www.drools.org/learn/dmn.html) specification;
* Decision tables implementation using XLS.
* Usage of the rules engine based on KIE Server and running on top of SpringBoot;
* CI/CD Pipeline implemented using Tekton;
* How to configure webhooks in your pipeline to deploy based on changes on a git repository;
* Automated tests for decisions (with Test Scenarios ) that are considered during the pipeline execution;
* Deployment with zero downtime with OpenShift rolling deployment strategy;

## How to use this demo

### Pre-requisites

* OpenShift 4.7 

* oc client

* [VSCode](https://code.visualstudio.com/)

* [VSCode Business Automation Extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-extension-red-hat-business-automation-bundle)

  

# How to Provision the demo quick steps:

1. Fork this repository and clone your fork to your machine

   ```
   $ git clone https://github.com/${yourgithubuser}/business-automation-showcase.git
   $ cd my-business-automation-showcase
   ```

3. Run the provisioning script: 

   ```
   $ sh provision.sh
   ```

This provisioning script will:

- Create a new namespace called rhdm-kieserver-cicd
- Install OpenShift Pipelines
- Create the pipeline resources
- Deploy a front-end application that you can use to interact with the decision service once you deploy it.



1. 
2. Create a new project

`oc new-project rhpam-sandbox`

3. Install the OpenShift Pipelines Operator;

4. Fork this repository, and clone the fork to your machine. Enter the project directory:

   ```
   $ git clone https://github.com/${yourgithubuser}/my-business-automation-showcase.git
   $ cd my-business-automation-showcase
   ```

5. Create the Pipeline in OpenShift using the command:

   `$ oc create -f ./cicd/tekton-resources/ -n rhpam-sandbox`

6. Expose the Pipeline Event Listener service

   `$ oc expose svc el-ba-cicd-event-listener -n rhpam-sandbox`

7. Configure the GitHub Webhook.

   * Grab the URL to the Pipeline Event Listener using the command below

     `$ echo "$(oc  get route el-ba-cicd-event-listener --template='http://{{.spec.host}}')" `

   * In GitHub, add a new Webhook. 

     * Payload URL: is the URL you obtained in the previous command;
     * Content type: `application/json`
     * Secret: empty
     * Which events would you like to trigger this webhook?: Just the push event.

8. Deploy the client service if you want to consume the rules using a front-end application:

   ```
   $ oc new-app quay.io/rafaeltuelho/business-application-webclient -n rhpam-sandbox 
   $ oc expose service/business-application-webclient
   $ echo "$(oc  get route business-application-webclient --template='http://{{.spec.host}}')"
   ```

9. Open the client application URL that will be exposed. Once it is deployed, go to the application settings, and update your KIE Server URL. You can get the KIE Server URL by running the command below.  

   `echo "$(oc  get route business-application-service-route --template='http://{{.spec.host}}')/rest/server"`

10. Test the decision services.



## Extra information

At the moment there are 5 projects in this repository:

* [decisions-showcase](decisions-showcase/): Decision use cases using Business Rules (Drools) and Decision Logic (DMN)
* [business-application-service](business-application-service/): Spring Boot runtime based Kie Server exposing the API for Decisions and Processes
* [business-application-webclient](business-application-webclient/): ReactJS Web client App UI used to interact with the Kie Server API to exercise the Use Cases provided with this Showcase demo
* [cicd](cicd/): Tekton Pipeline resources to implement a fully automated CI/CD pipeline for your Business Application Services
* [monitoring](monitoring/): working in progress...

To see a detailed instruction on each service and each deployment processes (with images), check:

* [Provisioning and testing the CI/CD Pipeline](cicd/readme.md)
* [Provisioning and testing the client application ](business-application-webclient/readme.me)
