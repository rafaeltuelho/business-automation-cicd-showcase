#FROM gcr.io/cloud-builders/mvn:latest
FROM registry.access.redhat.com/ubi8/openjdk-11:latest

LABEL author="Rafael T. C. Soares <rsoares@redhat.com>"

ARG OC_PKG_URL="https://mirror.openshift.com/pub/openshift-v4/clients/oc/latest/linux/oc.tar.gz"

# Download and install oc and kubectl client
USER root
RUN (curl -0 $OC_PKG_URL | tar -zx -C /usr/bin) && \
 chmod a+x /usr/bin/oc && \
 chmod a+x /usr/bin/kubectl

# return to jboss user
USER 185