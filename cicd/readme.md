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
