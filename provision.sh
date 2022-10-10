LOGGEDIN_USER=$(oc whoami)
echo Input a namespace root - first letter lowercase
read -p 'namespace: ' namespace

## Validate if user is logged in OCP
if [ "$LOGGEDIN_USER" = *"Unable to connect to the server"* ]; then
    echo "You need to login to an OpenShift cluster first."
    exit 255
fi

################################################################################
# Functions                                                                    #
################################################################################

function echo_header() {
  echo
  echo "########################################################################"
  echo $1
  echo "########################################################################"
}

function print_info() {
  echo_header "Configuration"

  #OPENSHIFT_MASTER=$(oc status | head -1 | sed 's#.*\(https://[^ ]*\)#\1#g') # must run after projects are created
  OPENSHIFT_MASTER=$(oc version | tail -3 | head -1 | sed 's#.*\(https://[^ ]*\)#\1#g')

  echo "Project name:        ${PRJ[0]}"
  echo "OpenShift master:    $OPENSHIFT_MASTER"
  echo "Current user:        $LOGGEDIN_USER"
  echo "Project suffix:      $PRJ_SUFFIX"
}

# Create Project
function create_projects() {
  echo_header "Creating project..."

  echo "Creating project ${PRJ[0]}"
  echo  "Running oc new-project "${PRJ[0]}" --display-name="${PRJ[1]}" --description="${PRJ[2]}" >/dev/null"
  oc new-project "${PRJ[0]}" --display-name="${PRJ[1]}" --description="${PRJ[2]}" >/dev/null
}


function wait_while_empty() {
  local _NAME=$1
  local _TIMEOUT=$(($2/5))
  local _CONDITION=$3

  echo "Waiting for $_NAME to be ready..."
  local x=1
  while [ -z "$(eval ${_CONDITION})" ]
  do
    echo "."
    sleep 5
    x=$(( $x + 1 ))
    if [ $x -gt $_TIMEOUT ]
    then
      echo "$_NAME still not ready, I GIVE UP!"
      exit 255
    fi
  done

  echo "$_NAME is ready."
}

#Runs a spinner for the time passed to the function.
function runSpinner() {
  sleeptime=0.5
  maxCount=$( bc <<< "$1 / $sleeptime")
  counter=0
  i=1
  sp="/-\|"
  while [ $counter -lt $maxCount ]
  do
    printf "\b${sp:i++%${#sp}:1}"
    sleep $sleeptime
    let counter=counter+1
  done
}

START=`date +%s`

################################################################################
# Configuration                                                                #
################################################################################
PRJ=("$namespace-rhdm-kieserver-cicd" "Decision Services CI/CD Demo" "Red Hat Decision Manager deployment automation demo")

################################################################################
# Provisioning                                                                 #
################################################################################

## Create a new project for the v7 Spring-boot based cicd demo

echo_header "Creating namespace $PRJ"
create_projects 

echo_header "Installing OpenShift Pipelines (Tekton) and pipeline resources"
## Install OpenShift Pipelines Operator
oc apply -f ./support/tekton-operator/sub.yaml 
wait_while_empty "Openshift Pipelines Operator" 100 "oc get ClusterServiceVersion | grep redhat-openshift-pipelines | grep -i succeed | awk '{ printf \$8 }'"

runSpinner 10
oc create -f ./cicd/tekton-resources/ -n $PRJ
runSpinner 5
oc expose svc el-ba-cicd-event-listener -n $PRJ

##### Deploy Sonatype Nexus 3 for a Maven Repository
oc new-app sonatype/nexus3 name=Nexus3
oc expose svc/nexus3


# Front end application
echo_header "Deploying front-end application"

oc new-app quay.io/rafaeltuelho/decision-service-webclient -n $PRJ
oc expose service/decision-service-webclient -n $PRJ

runSpinner 100
echo ""
echo ""
echo "******************************************************************"
echo ""
echo "Use this URL in your GitHub Webhook configuration for automatic deployment"
echo "$(oc get route el-ba-cicd-event-listener --template='http://{{.spec.host}}' -n $PRJ)"
echo ""
echo "Use this URL to access the front-end application:                "
echo "$(oc  get route decision-service-webclient --template='http://{{.spec.host}}' -n $PRJ)"
echo ""
echo "Use this URL to access the Nexus Repository:                "
echo "$(oc  get route nexus3 --template='http://{{.spec.host}}' -n $PRJ)"
echo "" 
echo "Use this password for admin access to Nexus 3:                "
echo "$(oc exec $(oc get pod -o template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | grep nexus) -- cat /nexus-data/admin.password)"
echo ""
echo "******************************************************************"

END=`date +%s`
echo
echo "Provisioning done! (Completed in $(( ($END - $START)/60 )) min $(( ($END - $START)%60 )) sec)"
