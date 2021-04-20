FROM gcr.io/cloud-builders/mvn:latest

LABEL author="Rafael T. C. Soares <rsoares@redhat.com>"

ARG OC_PKG_URL="https://mirror.openshift.com/pub/openshift-v4/clients/oc/latest/linux/oc.tar.gz"

# Download and install oc and kubectl client
RUN (curl -0 $OC_PKG_URL | tar -zx -C /usr/bin) && \
 chmod +x /usr/bin/oc && \
 chmod +x /usr/bin/kubectl