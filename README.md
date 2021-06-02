# Red Hat Business Automation Showcase

This repository contains projects that showcase some capabilities provided by the Red Hat Business Automation Solution Portfolio. Red Hat Process Automation solutions are application development platforms,
designed to enable business users to participate with IT developers in the creation of modern cloud-native applications. These platforms are called:

* Red Hat Decision Manager (RHDM) and
* Red Hat Process Automation Manager (RHPAM)

At the moment there are 5 projects in this repository:

* [decisions-showcase](decisions-showcase/): Decision use cases using Business Rules (Drools) and Decision Logic (DMN)
* [business-application-service](business-application-service/): Spring Boot runtime based Kie Server exposing the API for Decisions and Processes
* [business-application-webclient](business-application-webclient/): ReactJS Web client App UI used to interact with the Kie Server API to exercise the Use Cases provided with this Showcase demo
* [cicd](cicd/): Tekton Pipeline resources to implement a fully automated CI/CD pipeline for your Business Application Services
* [monitoring] (monitoring/): currently working in progress...

See below a short guide on how to provision.

To see a detailed instruction on each service and each deployment processes (with images), check:

* [Provisioning and testing the CI/CD Pipeline](cicd/readme.md)
* [Provisioning and testing the client application ](business-application-webclient/readme.me)

# How to Provision the demo quick steps:

1. Log in to your OpenShift cluster in your terminal, using the oc client.
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
