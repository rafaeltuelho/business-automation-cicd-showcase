# CICD Demo script

 1. Create an Openshift Project

 2. Install Tekton/Pipeline Operator in your Cluster

 3. Apply the Openshift Pipelines (Tekton) Resources
    3.1 Fork and Clone this repo

    ```
 		Event Listener
 		Triggers
			Template
			Binding
 		Tasks
 		Pipeline
 		PVCs for maven and git
 			maven-repo-pvc
 			shared-workspace
 		ConfigMap with the Maven settings.xml (with the correct nexus credentials)
    ```

	3.2 Run the following command to create the Tekton resources into your project namespace:
	```
	oc create -f tekton-resources/

	configmap/custom-maven-settings created
	eventlistener.triggers.tekton.dev/ba-cicd-event-listener created
	persistentvolumeclaim/maven-repo-pvc created
	task.tekton.dev/mvn-jkube created
	task.tekton.dev/mvn created
	pipeline.tekton.dev/ba-cicd-pipeline created
	persistentvolumeclaim/source-workspace-pvc created
	triggerbinding.triggers.tekton.dev/ba-cicd-trigger-binding created
	triggertemplate.triggers.tekton.dev/ba-cicd-trigger-template created	
	```

	3.3 Expose the Pipeline Event Listener
	```
	oc expose svc el-ba-cicd-event-listener
	route.route.openshift.io/el-ba-cicd-event-listener exposed	
	```

	3.4 Create the Git Webhook to trigger your Pipeline
	```
	echo "URL: $(oc  get route el-ba-cicd-event-listener --template='http://{{.spec.host}}')"
	URL: http://el-ba-cicd-event-listener-rhpam-sandbox.your.cluster.domain.com
	```

 1. Make some changes and push it to Git  
  * Configure a Webhook pointing to Pipeline **Event Listener**

  * Create a new branch (eg: v1.0.0-Final)
  ```
 	git commit -m "v1.0.0-Final"
  ```

  * make some changes
  ```
 	git add .
 	git commit -m "new release..."
 	git push origin v1.0.0-Final
  ```

## Build a custom Tekton Maven Task image

```
docker build -f docker/mvn-with-oc-task.dockerfile \ 
--no-cache \ 
--build-arg OC_PKG_URL="https://mirror.openshift.com/pub/openshift-v4/clients/oc/latest/linux/oc.tar.gz" \
-t quay.io/rafaeltuelho/mvn-kube-oc:latest .
```

## Clean up your namespace

```
oc delete all -l provider=jkube -n <namespace>

pod "business-application-service-1-9nl6j" deleted
pod "business-application-service-1-tnqth" deleted
replicationcontroller "business-application-service-1" deleted
service "business-application-service" deleted
deploymentconfig.apps.openshift.io "business-application-service" deleted
buildconfig.build.openshift.io "business-application-service-s2i" deleted
build.build.openshift.io "business-application-service-s2i-1" deleted
imagestream.image.openshift.io "business-application-service" deleted
route.route.openshift.io "business-application-service" deleted
```