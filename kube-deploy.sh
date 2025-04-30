#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Building backend Docker image ---"
docker build -t minimallm-backend:latest ./backend

echo "--- Building frontend Docker image (no cache) ---"
docker build --no-cache -t minimallm-frontend:latest ./frontend

echo "--- Loading images into Minikube ---"
minikube image load minimallm-backend:latest
minikube image load minimallm-frontend:latest

echo "--- Deleting existing Kubernetes resources (optional, for clean slate) ---"
kubectl delete -f ./yaml_manifests/ || echo "No resources found to delete, continuing..."
sleep 5 # Give resources time to terminate

echo "--- Applying Kubernetes manifests ---"
kubectl apply -f ./yaml_manifests/

echo "--- Waiting for deployments to be ready ---"
kubectl wait --for=condition=Available deployment/minimallm-backend --timeout=120s
kubectl wait --for=condition=Available deployment/minimallm-frontend --timeout=120s

echo "--- Deployment complete. Checking status: ---"
kubectl get deployments
kubectl get services
kubectl get ingress
kubectl get pods

echo "--- Frontend pod details: ---"
# Get the name of a potentially new frontend pod
FRONTEND_POD=$(kubectl get pods -l app=minimallm-frontend -o jsonpath="{.items[0].metadata.name}")
if [ -n "$FRONTEND_POD" ]; then
  echo "Showing logs for pod: $FRONTEND_POD"
  # Wait for the pod to be running before getting logs
  kubectl wait --for=condition=Ready pod/$FRONTEND_POD --timeout=60s
  kubectl logs $FRONTEND_POD
else
  echo "Could not find frontend pod."
fi

echo "--- You may need to run 'minikube tunnel' in a separate terminal for Ingress to work ---"