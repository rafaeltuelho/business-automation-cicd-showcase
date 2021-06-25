Business Application Service
=============================

This project was generated using https://start.jbpm.org/

It is a Spring Boot runtime based Kie Server used to execute Business Rules and Decision Models packaged as KJARs.

Alternatively use the following command to bootstrap a Business Application using the [KIE Service Spring Boot Archetype](https://github.com/kiegroup/droolsjbpm-knowledge/tree/master/kie-archetypes/kie-service-spring-boot-archetype):

```
mvn archetype:generate \
   -DarchetypeGroupId=org.kie \
   -DarchetypeArtifactId=kie-service-spring-boot-archetype \
   -DarchetypeVersion=7.50.0.Final \
   -DappType=brm
```

> NOTE: remember to update the `application.properties` or configure the `kie-maven-plugin` to properly add your decision/rules `kjar` artifact as a dependency.
>
> The Kie Server **state file** used to start the Kie Container for the Decision Showcase project **KJAR** is: `src/business-application-service.xml`.
> 
> note that the Scanner is configured to scan the kjar every 60secs. In this way you can change your rules, rebuild and install the kjar for demo purposes.

## Self contained Immutable Fatjar

Starting with version `7.44.0.Final` you can use the `kie-maven-plugin` to package your kjar in the spring boot uberjar. Add these props in your Spring Boot `application.properties`:
```
kieserver.classPathContainer=true
kieserver.autoScanDeployments=true
```

and configure your Spring Boot app `kie-maven-plugin` in your pom.xml like this:
```xml
  <build>
    <plugins>
      <plugin>
        <groupId>org.kie</groupId>
        <artifactId>kie-maven-plugin</artifactId>
        <version>${version.org.kie}</version>
        <executions>
          <execution>
            <id>copy</id>
            <phase>prepare-package</phase>
            <goals>
              <goal>package-dependencies-kjar</goal>
            </goals>
          </execution>
        </executions>
        <configuration>
          <artifactItems>
            <artifactItem>
              <groupId>com.myspace</groupId>
              <artifactId>your kjar artifcat id</artifactId>
              <version>1.0.0-SNAPSHOT</version>
            </artifactItem>
          </artifactItems>
        </configuration>
      </plugin>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
```

> With the above configuration you don't need to provide the Kie Server state file (`.xml`) in order to get your kie container deployed as the kie-maven-plugin will take care of the deployment.

## Enable Swagger API Docs

> If want to enable swagger Api Docs on your Spring Boot based application add these deps in your `pom.xml`

```xml
    <dependency>
      <groupId>org.apache.cxf</groupId>
      <artifactId>cxf-rt-rs-service-description-swagger</artifactId>
      <version>3.2.6</version>
    </dependency>
    <dependency>
      <groupId>io.swagger</groupId>
      <artifactId>swagger-jaxrs</artifactId>
      <version>1.5.15</version>
      <exclusions>
        <exclusion>
          <groupId>javax.ws.rs</groupId>
          <artifactId>jsr311-api</artifactId>
        </exclusion>
      </exclusions>
    </dependency>
    <dependency>
      <groupId>org.webjars</groupId>
      <artifactId>swagger-ui</artifactId>
      <version>3.43.0</version>
    </dependency>
```

and add this property on your `application.properties`
```
kieserver.swagger.enabled=true
```

For more details on how customize and configure the Kie Server on Spring Boot check the official Docs at https://access.redhat.com/documentation/en-us/red_hat_process_automation_manager/7.10/html-single/integrating_red_hat_process_automation_manager_with_other_products_and_components/index#assembly-springboot-business-apps

## Build the Spring Boot app

```
mvn clean install
```

## Run the service locally

```
java -jar target/business-application-service-1.0-SNAPSHOT.jar
```

## Access the Kie Server (Swagger) API Docs

http://localhost:8090/rest/api-docs?url=http://localhost:8090/rest/swagger.json

you can authenticate with `kieserver/kieserver1!`


## Docker Image build
A Docker Image can be built using the [jKube **Kubernates** Maven Plugin](https://www.eclipse.org/jkube/docs/kubernetes-maven-plugin)

Assuming you have Docker Engine up and running on your local environment, execute the following command to generate the container image for this app.
```
mvn clean install -Pdocker
```

expect an output similar to the following:
```
...
[INFO] k8s: Building Docker image in Kubernetes mode
[INFO] k8s: [apps/business-application-service:1.0-SNAPSHOT]: Created docker-build.tar in 1 second 
[INFO] k8s: [apps/business-application-service:1.0-SNAPSHOT]: Built image sha256:01593
[INFO] k8s: [apps/business-application-service:1.0-SNAPSHOT]: Removed old image sha256:31b49
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  17.043 s
[INFO] Finished at: 2021-03-04T13:35:30-05:00
[INFO] ------------------------------------------------------------------------
```

> The image generation configuration can be tuned via the `kubernates-maven-plugin` in the `pom.xml`

## Openshift build/deployment
The application can be directly deployed into an existing Openshift cluster using the [jKube **Openshift** Maven Plugin](https://www.eclipse.org/jkube/docs/openshift-maven-plugin)

Assuming you are logged into an Openshift Cluster (`oc login...`), execute the following command to start the deployment process of your app into the current namespace (openshift project).
```
mvn clean install -Popenshift
```

expect an output similar to the following:
```
[INFO] oc: Build business-application-service-s2i-1 in status Complete
[INFO] oc: Found tag on ImageStream business-application-service tag: sha256:e98fa1316b236b0c70c6d97c0e5e22544e982327ecabfc9902d0fcaaf0ff20a5
[INFO] oc: ImageStream business-application-service written to /Users/rsoares/dev/github/rafaeltuelho/my-business-automation-showcase/business-application-service/target/business-application-service-is.yml
[INFO] 
[INFO] --- openshift-maven-plugin:1.1.1:apply (default-cli) @ business-application-service ---
[INFO] oc: Using OpenShift at https://api.cluster.com:6443/ in namespace dmlab with manifest /Users/rsoares/dev/github/rafaeltuelho/my-business-automation-showcase/business-application-service/target/classes/META-INF/jkube/openshift.yml 
[INFO] oc: OpenShift platform detected
[INFO] oc: Creating a Service from openshift.yml namespace dmlab name business-application-service
[INFO] oc: Created Service: target/jkube/applyJson/dmlab/service-business-application-service.json
[INFO] oc: Creating a DeploymentConfig from openshift.yml namespace dmlab name business-application-service
[INFO] oc: Created DeploymentConfig: target/jkube/applyJson/dmlab/deploymentconfig-business-application-service.json
[INFO] oc: HINT: Use the command `oc get pods -w` to watch your pods start up
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  03:07 min
[INFO] Finished at: 2021-03-04T19:51:52-05:00
[INFO] ------------------------------------------------------------------------
```

The above command will generate the openshif resources and trigger a Binary Build to build the app image inside the current namespace. After a while you can execute:

```
mvn oc:resource oc:apply -Popenshift
```

to create the DeploymentConfig, Service and Route resources.

## Start your Business Application Service

```
java -jar target/business-application-service-1.0-SNAPSHOT.jar
```

## Note about KieScanner

ref: https://docs.jboss.org/drools/release/7.49.0.Final/drools-docs/html_single/#_kiescanner
```
The settings.xml file can be located in 3 locations, the actual settings used is a merge of those 3 locations.
    The Maven install: $M2_HOME/conf/settings.xml

    A user’s install: ${user.home}/.m2/settings.xml

    Folder location specified by the system property kie.maven.settings.custom
```