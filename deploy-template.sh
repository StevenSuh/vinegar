#!/bin/bash
SHA=$(git rev-parse HEAD)
SALT=
POSTGRES_PASSWORD=
DOCKER_LOGIN=stevenesuh
DOCKER_PASSWORD=
DEV=

ALL='true'
CLIENT=
SERVER=
INTERVAL=
WORKER=

START_TIME=$(date +%s)

make lint-no-fix
if [ $? -eq 1 ]; then
  exit 1
fi

if [ -z "$SHA" ] || \
   [ -z "$SALT" ] || \
   [ -z "$POSTGRES_PASSWORD" ] || \
   [ -z "$DOCKER_LOGIN" ] || \
   [ -z "$DOCKER_PASSWORD" ]; then
  echo "You need to set the secrets before deploying."
  exit 1
fi
if [ ! -f "vinegar-google-credentials.json" ]; then
  echo "You need to get GCP credentials before deploying."
  exit 1
fi
if [ -z "$(which gcloud)" ] || \
   [ -z "$(which docker)" ] || \
   [ -z "$(which kubectl)" ]; then
  echo "You need to install the appropriate softwares to deploy."
  exit 1
fi

if [ -z "$(which helm)" ]; then
  curl https://raw.githubusercontent.com/helm/helm/master/scripts/get > get_helm.sh
  chmod 700 get_helm.sh
  ./get_helm.sh
fi

while test $# -gt 0; do
  case "$1" in
    -d|--dev)
      DEV='true'
      break;;
    --no-cache)
      make reset
      break;;
    --client)
      ALL=''
      CLIENT='true'
      break;;
    --server)
      ALL=''
      SERVER='true'
      break;;
    --interval)
      ALL=''
      INTERVAL='true'
      break;;
    --worker)
      ALL=''
      WORKER='true'
      break;;
    *)
      break;;
  esac
done

if [ -z "$DEV" ]; then
  gcloud auth activate-service-account --key-file vinegar-google-credentials.json
  gcloud config set project vinegar
  gcloud config set compute/zone us-west1-a
  gcloud container clusters get-credentials vinegar-prod
else
  kubectl config use-context minikube
fi

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_LOGIN" --password-stdin

if [ "$ALL" == 'true' ] ||
   [ "$CLIENT" == 'true' ]; then
  ls client
  if [ $? -eq 1 ]; then
    echo "The script is being called from wrong directory."
    exit 1
  fi
  cd client && yarn build
  cd .. && rm -rf shared/css && cp -rf client/dist/css shared
  rm -rf client/dist

  docker build -t stevenesuh/vinegar-client:latest -t stevenesuh/vinegar-client:$SHA -f ./client/Dockerfile ./client
  docker push stevenesuh/vinegar-client:latest
  docker push stevenesuh/vinegar-client:$SHA
fi

if [ "$ALL" == 'true' ] ||
   [ "$SERVER" == 'true' ]; then
  docker build -t stevenesuh/vinegar-server:latest -t stevenesuh/vinegar-server:$SHA -f ./server/Dockerfile .
  docker push stevenesuh/vinegar-server:latest
  docker push stevenesuh/vinegar-server:$SHA
fi

if [ "$ALL" == 'true' ] ||
   [ "$INTERVAL" == 'true' ]; then
  REDIS_POD=$(kubectl get pods -o name | grep redis-deployment | cut -c 5-)
  kubectl exec -it "$REDIS_POD" redis-cli DEL robin:total robin:rotate robin:invalid

  docker build -t stevenesuh/vinegar-interval:latest -t stevenesuh/vinegar-interval:$SHA -f ./interval/Dockerfile .
  docker push stevenesuh/vinegar-interval:latest
  docker push stevenesuh/vinegar-interval:$SHA
fi

if [ "$ALL" == 'true' ] ||
   [ "$WORKER" == 'true' ]; then
  REDIS_POD=$(kubectl get pods -o name | grep redis-deployment | cut -c 5-)
  kubectl exec -it "$REDIS_POD" redis-cli DEL worker:total worker:rotate worker:invalid

  docker build -t stevenesuh/vinegar-worker:latest -t stevenesuh/vinegar-worker:$SHA -f ./worker/Dockerfile .
  docker push stevenesuh/vinegar-worker:latest
  docker push stevenesuh/vinegar-worker:$SHA
fi

# one-time tiller service activation
kubectl get serviceaccount --namespace kube-system tiller
if [ $? -eq 1 ]; then
  echo "The cluster is missing tiller service account"
  kubectl create serviceaccount --namespace kube-system tiller
  kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller

  helm init --service-account tiller --upgrade
  sleep 10
  helm install stable/nginx-ingress --name my-nginx --set rbac.create=true

  kubectl apply -f https://raw.githubusercontent.com/jetstack/cert-manager/release-0.6/deploy/manifests/00-crds.yaml
  kubectl create namespace cert-manager
  kubectl label namespace cert-manager certmanager.k8s.io/disable-validation=true
  sleep 10
  helm repo update
  helm install \
    --name cert-manager \
    --namespace cert-manager \
    --version v0.6.6 \
    stable/cert-manager
fi

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

if [ "$ALL" == 'true' ]; then
  kubectl apply -f k8s/issuer.yaml
  kubectl apply -f k8s
  kubectl set image deployments/client-deployment client=stevenesuh/vinegar-client:$SHA
  kubectl set image deployments/server-deployment server=stevenesuh/vinegar-server:$SHA
  kubectl set image deployments/interval-deployment interval=stevenesuh/vinegar-interval:$SHA
  kubectl set image deployments/worker-deployment worker=stevenesuh/vinegar-worker:$SHA
fi

if [ "$CLIENT" == 'true' ]; then
  kubectl apply -f k8s/client-deployment.yaml
  kubectl set image deployments/client-deployment client=stevenesuh/vinegar-client:$SHA
fi

if [ "$SERVER" == 'true' ]; then
  kubectl apply -f k8s/server-deployment.yaml
  kubectl set image deployments/server-deployment server=stevenesuh/vinegar-server:$SHA
fi

if [ "$INTERVAL" == 'true' ]; then
  kubectl apply -f k8s/interval-deployment.yaml
  kubectl set image deployments/interval-deployment interval=stevenesuh/vinegar-interval:$SHA
fi

if [ "$WORKER" == 'true' ]; then
  kubectl apply -f k8s/worker-deployment.yaml
  kubectl set image deployments/worker-deployment worker=stevenesuh/vinegar-worker:$SHA
fi

END_TIME=$(date +%s)
echo "It took $((END_TIME - START_TIME)) seconds to deploy."
