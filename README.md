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

* Java 8

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

4. Now, we'll configure the git hook for automated deployment. In your GitHub project settings, locate "Webhook" in the side, and click on the "Add webhook" button. 
5. Fill the form with the information below:
   * **Payload URL**:  you can get URL to the `Pipeline Event Listener` using the command:
     * `$ echo "$(oc  get route el-ba-cicd-event-listener --template='http://{{.spec.host}}')" `
   * **Content type**: `application/json`
   * **Secret**: empty
   * "**Which events would you like to trigger this webhook?**: `Just the push event`.

With this, you should already have a fully automated integration and deployment lifecycle for the application [#TODO link here]. 

### Testing this application

This is a general guide on how to test it: 

1. Trigger the first deployment
2. Test the decision service using the client application. You can try the DMN use case. Check the results of the decision.
3. Open the application [#TODO link here] in vscode and edit the DMN file. Remember to adjust the test scenario or your pipeline might fail in the test phase.
4. Commit and push to your repository (your fork).
5. Monitor the pipeline and deployment. Use the client application to validate the new rules deployment.

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
