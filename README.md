# My Business Automation Showcase App

This repository contains projects that showcases some capabilities provided by the Red Hat
Business Automation Solution Portfolio which includes:

* Red Hat Decision Manager (RHDM) and
* Red Hat Process Automation Manager (RHPAM)

At the moment these 3 project are provided:

* [decisions-showcase](decisions-showcase/): includes use cases of Business Rules (Drools) and Decision Logic (DMN)
* [business-application-service](business-application-service/): Spring Boot rutime based Kie Server exposing the API for Decisions and Process
* [business-application-webclient](business-application-webclient/): ReactJS Web App UI use to interact with the Kie Server API to exercise the Use Cases provided in this Showcase.
* [cicd](cicd/): Tekton Pipeline resources to implement a simple CI/CD pipeline for your Business Application Services.

Open each sub-directory project folder to see detailed instructions (see `readme.md` files) in order to deploy and run them.