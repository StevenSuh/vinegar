#!/bin/bash
SHA=$(git rev-parse HEAD)

gcloud config set project vinegar
gcloud config set compute/zone us-west2-b

docker build -t stevenesuh/vinegar-client:latest -t stevenesuh/vinegar-client:$SHA -f ./client/Dockerfile ./client
docker build -t stevenesuh/vinegar-server:latest -t stevenesuh/vinegar-server:$SHA -f ./server/Dockerfile .
docker build -t stevenesuh/vinegar-interval:latest -t stevenesuh/vinegar-interval:$SHA -f ./interval/Dockerfile .
docker build -t stevenesuh/vinegar-worker:latest -t stevenesuh/vinegar-worker:$SHA -f ./worker/Dockerfile .

docker push stevenesuh/vinegar-client:latest
docker push stevenesuh/vinegar-server:latest
docker push stevenesuh/vinegar-interval:latest
docker push stevenesuh/vinegar-worker:latest

docker push stevenesuh/vinegar-client:$SHA
docker push stevenesuh/vinegar-server:$SHA
docker push stevenesuh/vinegar-interval:$SHA
docker push stevenesuh/vinegar-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/server-deployment server=stevenesuh/vinegar-server:$SHA
kubectl set image deployments/client-deployment client=stevenesuh/vinegar-client:$SHA
kubectl set image deployments/worker-deployment worker=stevenesuh/vinegar-interval:$SHA
kubectl set image deployments/worker-deployment worker=stevenesuh/vinegar-worker:$SHA
