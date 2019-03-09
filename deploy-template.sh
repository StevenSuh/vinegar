#!/bin/bash
# add -d or --dev to test on minikube/local kubernetes setup

SHA=$(git rev-parse HEAD)
SALT= # get these from owner
POSTGRES_PASSWORD= # get these from owner
DOCKER_LOGIN= # get these from owner
DOCKER_PASSWORD= # get these from owner
DEV=

if [ -z "$SHA" ] || \
   [ -z "$SALT" ] || \
   [ -z "$POSTGRES_PASSWORD" ] || \
   [ -z "$DOCKER_LOGIN" ] || \
   [ -z "$DOCKER_PASSWORD" ]; then
  echo "You need to set the secrets before deploying."
  exit 1
fi
if [ ! -f vinegar-google-credentials.json ]; then
  echo "You need to get GCP credentials before deploying."
  exit 1
fi
if [ -z "$(which gcloud)" ] || \
   [ -z "$(which docker)" ] || \
   [ -z "$(which kubectl)" ]; then
  echo "You need to install the appropriate softwares to deploy."
  exit 1
fi

while test $# -gt 0; do
  case "$1" in
    -d|--dev)
      DEV='true'
      break;;
    *)
      break;;
  esac
done

if [ -z "$DEV" ]; then
  gcloud auth activate-service-account --key-file vinegar-google-credentials.json
  gcloud container clusters get-credentials vinegar-prod
  gcloud config set project vinegar
  gcloud config set compute/zone us-west2-b
else
  kubectl config use-context minikube
fi

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_LOGIN" --password-stdin
docker build -t stevenesuh/vinegar-client:latest -t stevenesuh/vinegar-client:$SHA -f ./client/Dockerfile ./client
docker build -t stevenesuh/vinegar-server:latest -t stevenesuh/vinegar-server:$SHA -f ./server/Dockerfile .
docker build -t stevenesuh/vinegar-interval:latest -t stevenesuh/vinegar-interval:$SHA -f ./interval/Dockerfile .

docker push stevenesuh/vinegar-client:latest
docker push stevenesuh/vinegar-server:latest
docker push stevenesuh/vinegar-interval:latest
docker push stevenesuh/vinegar-client:$SHA
docker push stevenesuh/vinegar-server:$SHA
docker push stevenesuh/vinegar-interval:$SHA

kubectl get secret google-credentials
if [ $? -eq 1 ]; then
  echo "The cluster is missing google-credentials"
  exit 1
  # kubectl create secret generic google-credentials --from-file=key.json=vinegar-google-credentials.json
fi

kubectl get secret passwordsalt
if [ $? -eq 1 ]; then
  echo "The cluster is missing passwordsalt"
  exit 1
  # kubectl create secret generic passwordsalt --from-literal PASSWORD_SALT_SECRET=$SALT
fi

kubectl get secret postgrespassword
if [ $? -eq 1 ]; then
  echo "The cluster is missing postgrespassword"
  exit 1
  # kubectl create secret generic postgrespassword --from-literal POSTGRES_PASSWORD=$POSTGRES_PASSWORD
fi

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/provider/cloud-generic.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/mandatory.yaml
kubectl apply -f k8s
kubectl set image deployments/client-deployment client=stevenesuh/vinegar-client:$SHA
kubectl set image deployments/server-deployment server=stevenesuh/vinegar-server:$SHA
kubectl set image deployments/interval-deployment interval=stevenesuh/vinegar-interval:$SHA
