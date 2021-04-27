# Red Hat Business Automation Showcase

This repository contains projects that showcase some capabilities provided by the Red Hat
Business Automation Solution Portfolio. Red Hat Process Automation solutions are application development platforms,
designed to enable business users to participate with IT developers in the creation of modern cloud-native applications. These platforms are called:

* Red Hat Decision Manager (RHDM) and
* Red Hat Process Automation Manager (RHPAM)

At the moment there are 5 projects in this repository:

* [decisions-showcase](decisions-showcase/): Decision use cases using Business Rules (Drools) and Decision Logic (DMN)
* [business-application-service](business-application-service/): Spring Boot runtime based Kie Server exposing the API for Decisions and Processes
* [business-application-webclient](business-application-webclient/): ReactJS Web client App UI used to interact with the Kie Server API to exercise the Use Cases provided with this Showcase demo
* [cicd](cicd/): Tekton Pipeline resources to implement a fully automated CI/CD pipeline for your Business Application Services
* [monitoring] (monitoring/): currently working in progress...

Open each folder to see detailed instructions (see `readme.md` files) in order to deploy and run them.