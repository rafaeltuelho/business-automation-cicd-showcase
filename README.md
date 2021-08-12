# Red Hat Business Automation CI/CD Showcase

Check how you can use OpenShift Pipelines (a.k.a Tekton) to automate the delivery of decision services implemented with Red Hat PAM (a.k.a. jBPM). In this showcase you can see:

* The automation of repeatable decisions using the [DMN](https://www.drools.org/learn/dmn.html) specification;
* Decision tables implementation using XLS.
* Usage of the rules engine based on KIE Server and running on top of SpringBoot;
* CI/CD Pipeline implemented using Tekton;
* How to configure webhooks in your pipeline to deploy based on changes on a git repository;
* Automated tests for decisions (with Test Scenarios ) that are considered during the pipeline execution;
* Deployment with zero downtime with OpenShift rolling deployment strategy;

### Pre-requisites

* Java 8

* OpenShift 4.7 

* oc client

* [VSCode](https://code.visualstudio.com/)

* [VSCode Business Automation Extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-extension-red-hat-business-automation-bundle)

## Installing on OpenShift:

1. Fork this repository, in jbossdemocentral.

   ![Alt text](support/docs/images/github-fork-project.png?raw=true "Fork project")
   
2. Clone your fork to your local machine.

   ```
   $ git clone https://github.com/${yourgithubuser}/business-automation-showcase.git
   $ cd my-business-automation-showcase
   ```

3. Run the provisioning script (Linux/MacOS): 

   ```
   $ sh provision.sh
   ```

At the end you'll get two URLs: one to a client web application and one to use in the GitHub integration settings. Something like:

```
******************************************************************

Use this URL in your GitHub Webhook configuration for automatic deployment
http://el-ba-cicd-event-listener-rhdm-kieserver-cicd.apps.cluster- (...)

Use this URL to access the front-end application:
http://business-application-webclient-rhdm-kieserver-cicd.apps.cluster- (...)

******************************************************************
```

#### Configuring the automatic deployment on GitHub

1. To configure the webhook for automated deployment, open your fork in your GitHub. Next, add a new webhook by opening "**Settings** -> **Webhook** -> **Add webhook** button".

   ![Alt text](support/docs/images/github-new-webhook.png?raw=true "Add GitHub webhook")

1. Fill the form with the information below:
   * **Payload URL**:  provided after the provisioning. You can also get it using the command: `$ echo "$(oc  get route el-ba-cicd-event-listener --template='http://{{.spec.host}}')" `
   * **Content type**: `application/json`
   * **Secret**: empty
   * "**Which events would you like to trigger this webhook?**: `Just the push event`.

At this point, you should already have a fully automated integration and deployment lifecycle for the business application. Any changes pushed to your repository will trigger the pipeline in your OpenShift cluster.

**Testing GitHub and Pipeline integration**

If you run this test, a new deployment should be triggered. The pipeline will deploy the decision service for the first time.

1. In your terminal, access your project folder. 

2. Commit and push. You can use this empty commit sample if you need:

   ```
   git commit -m "an empty commit to test the pipeline" --allow-empty
   git push origin master	
   ```

3. In OpenShift, access: "**Pipelines** -> **ba-cicd-pipeline** -> **Pipeline Runs** " and check the progress of your application deployment.
	![Alt text](support/docs/images/ocp-demo-pipeline-run.png?raw=true "Pipeline progress")

#### Using the web application

The web application allows you to interact with the deployed rules and decisions in a specific KIE Server. In order to use it, you need to configure it first.

1. Open the web application. The url was provided during provisioning. You can also obtain it with the command `oc  get route business-application-webclient --template='http://{{.spec.host}}' -n rhdm-kieserver-cicd`.
2. [#todo]

## Extra information

The provisioning script `provision.sh` will:

- Create a new namespace called rhdm-kieserver-cicd
- Install OpenShift Pipelines
- Create the pipeline resources
- Deploy a front-end application that you can use to interact with the decision service once you deploy it.
- 
At the moment there are 5 projects in this repository:

* [decisions-showcase](decisions-showcase/): Decision use cases using Business Rules (Drools) and Decision Logic (DMN)
* [business-application-service](business-application-service/): Spring Boot runtime based Kie Server exposing the API for Decisions and Processes
* [business-application-webclient](business-application-webclient/): ReactJS Web client App UI used to interact with the Kie Server API to exercise the Use Cases provided with this Showcase demo
* [cicd](cicd/): Tekton Pipeline resources to implement a fully automated CI/CD pipeline for your Business Application Services
* [monitoring](monitoring/): working in progress...

To see a detailed instruction on each service and each deployment processes (with images), check:

* [Provisioning and testing the CI/CD Pipeline](cicd/readme.md)
* [Provisioning and testing the client application ](business-application-webclient/readme.me)
