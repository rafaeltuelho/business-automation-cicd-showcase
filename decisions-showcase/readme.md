# Decision and Rules Project

> project generated using the [kie-rules-archetype](https://github.com/rafaeltuelho/kie-project-archetypes) template (maven archetype)

## Building the kjar artifact

execute

```
mvn clean install
```

to build and install the kajar in  your local maven repository (`~/.m2/repository`)

## Deploying the kjar artifact

To deploy and run your kjar using a Spring Boot kie-server runtime, use the following command to bootstrap a Business Application using the [KIE Service Spring Boot Archetype](https://github.com/kiegroup/droolsjbpm-knowledge/tree/master/kie-archetypes/kie-service-spring-boot-archetype):

```
mvn archetype:generate \
   -DarchetypeGroupId=org.kie \
   -DarchetypeArtifactId=kie-service-spring-boot-archetype \
   -DarchetypeVersion=7.50.0.Final \
   -DappType=brm
```

You can also go to the start.jbpm.org and download a boostrap Spring Boot maven project from there.

> NOTE: remember to update the `application.properties` or configure the `kie-maven-plugin` to properly add reference to your decision/rules kjar artifact dependency.
> Starting with version `7.44.0.Final` you can use the `kie-maven-plugin` to package your kjar in the spring boot uberjar. Add these props in your Spring Boot `application.properties`:
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

To access the swagger ui: http://localhost:8090/rest/api-docs?url=http://localhost:8090/rest/swagger.json

## Executing your Decision Service
after building and deploying your kjar into a kie-server you can test the API using the following payload samples:

### DMN Decision
`GET`  http://localhost:8080/kie-server/services/rest/server/containers/kie-rules-templates-1.0.0-SNAPSHOT/dmn 
> if running on Spring Boot use this url: http://localhost:8090/rest/server/server/containers/kie-rules-templates-1.0.0-SNAPSHOT/dmn

copy the `model-namespace` and the `model-name`

`POST` http://localhost:8080/kie-server/services/rest/server/containers/kie-rules-templates-1.0.0-SNAPSHOT/dmn 
> if running on Spring Boot use this url: http://localhost:8090/rest/server/server/containers/kie-rules-templates-1.0.0-SNAPSHOT/dmn

Payload:
```json
{
  "model-namespace": "https://kiegroup.org/dmn/_4502BB15-E55D-4302-91EA-CFD7E2EA470C",
  "model-name": "Loan Approval",
  "decision-name" : [ ],
  "dmn-context" : 
    {
        "Credit Score" : 800,
        "DTI" : 0.2
    }
}
```

Response:

```json
{
    "type": "SUCCESS",
    "msg": "OK from container 'rules-archetype'",
    "result": {
        "dmn-evaluation-result": {
            "messages": [],
            "model-namespace": "https://kiegroup.org/dmn/_4502BB15-E55D-4302-91EA-CFD7E2EA470C",
            "model-name": "Loan Approval",
            "decision-name": [],
            "dmn-context": {
                "Loan Approval": "Approved",
                "DTI": 0.2,
                "Credit Score": 800
            },
            "decision-results": {
                "_C970A1A1-83F1-4590-BE74-EF1E46558069": {
                    "messages": [],
                    "decision-id": "_C970A1A1-83F1-4590-BE74-EF1E46558069",
                    "decision-name": "Loan Approval",
                    "result": "Approved",
                    "status": "SUCCEEDED"
                }
            }
        }
    }
}
```

### XLS decision Table rule base

`POST` http://localhost:8080/kie-server/services/rest/server/containers/instances/kie-rules-templates-1.0.0-SNAPSHOT
> if running on Spring Boot use this url: http://localhost:8090/rest/server/server/containers/instances/kie-rules-templates-1.0.0-SNAPSHOT

Payload:
```json
{
    "lookup": "stateless-session",
    "commands": [
        {
            "insert": {
                "object": {
                    "com.redhat.demos.decisiontable.Driver": {
                        "name": "Mr Joe Blogs",
                        "age": 30,
                        "priorClaims": 0,
                        "locationRiskProfile": "LOW"
                    }
                },
                "out-identifier": "driver_fact_out",
                "return-object": true
            }
        },
        {
            "insert": {
                "object": {
                    "com.redhat.demos.decisiontable.Policy": {
                        "type": "COMPREHENSIVE",
                        "discountPercent": 0
                    }
                },
                "out-identifier": "policy_fact_out",
                "return-object": true
            }
        },
        {
            "fire-all-rules": {
                "max": -1,
                "out-identifier": "fired"
            }
        }
    ]
}
```

Response:

```json
{
    "type": "SUCCESS",
    "msg": "Container rules-archetype successfully called.",
    "result": {
        "execution-results": {
            "results": [
                {
                    "value": 3,
                    "key": "fired"
                },
                {
                    "value": {
                        "com.redhat.demos.decisiontable.Driver": {
                            "name": "Mr Joe Blogs",
                            "age": 30,
                            "priorClaims": 0,
                            "locationRiskProfile": "LOW"
                        }
                    },
                    "key": "driver_fact_out"
                },
                {
                    "value": {
                        "com.redhat.demos.decisiontable.Policy": {
                            "type": "COMPREHENSIVE",
                            "approved": false,
                            "discountPercent": 20,
                            "basePrice": 120
                        }
                    },
                    "key": "policy_fact_out"
                },
                {
                    "value": [
                        {
                            "com.redhat.demos.decisiontable.Driver": {
                                "name": "Mr Joe Blogs",
                                "age": 30,
                                "priorClaims": 0,
                                "locationRiskProfile": "LOW"
                            }
                        },
                        {
                            "com.redhat.demos.decisiontable.Policy": {
                                "type": "COMPREHENSIVE",
                                "approved": false,
                                "discountPercent": 20,
                                "basePrice": 120
                            }
                        }
                    ],
                    "key": "facts"
                }
            ],
            "facts": [
                {
                    "value": {
                        "org.drools.core.common.DefaultFactHandle": {
                            "external-form": "0:1:1664356063:1664356063:1:DEFAULT:NON_TRAIT:com.redhat.demos.decisiontable.Driver"
                        }
                    },
                    "key": "driver_fact_out"
                },
                {
                    "value": {
                        "org.drools.core.common.DefaultFactHandle": {
                            "external-form": "0:2:1235907157:1235907157:2:DEFAULT:NON_TRAIT:com.redhat.demos.decisiontable.Policy"
                        }
                    },
                    "key": "policy_fact_out"
                }
            ]
        }
    }
}
```