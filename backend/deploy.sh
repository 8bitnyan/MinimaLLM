#!/bin/bash

set -e  # Exit on error

# Define colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying minimaLLM Backend to Kubernetes...${NC}"
echo -e "${YELLOW}=======================================${NC}"

# 1. Check if Docker is running
echo -e "\n${YELLOW}Checking if Docker is running...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Starting Docker...${NC}"
  open -a Docker
  
  # Wait for Docker to start
  echo -e "${YELLOW}Waiting for Docker to start...${NC}"
  until docker info > /dev/null 2>&1; do
    echo -n "."
    sleep 1
  done
  echo -e "\n${GREEN}Docker is now running!${NC}"
else
  echo -e "${GREEN}Docker is already running.${NC}"
fi

# 2. Check if Minikube is running
echo -e "\n${YELLOW}Checking if Minikube is running...${NC}"
if ! minikube status | grep -q "host: Running"; then
  echo -e "${RED}Minikube is not running. Starting Minikube...${NC}"
  minikube start --driver=docker --image-mirror-country=cn
else
  echo -e "${GREEN}Minikube is already running.${NC}"
fi

# 3. Switch to Minikube's Docker context
echo -e "\n${YELLOW}Switching to Minikube's Docker context...${NC}"
eval $(minikube docker-env)
echo -e "${GREEN}Now using Minikube's Docker daemon.${NC}"

# 4. Build the backend Docker image
echo -e "\n${YELLOW}Building backend Docker image...${NC}"
docker build -t minima-backend:latest .
echo -e "${GREEN}Backend Docker image built successfully.${NC}"

# 5. Check if your OpenAI API key is set
OPENAI_API_KEY=${OPENAI_API_KEY:-"your-api-key"}
if [ "$OPENAI_API_KEY" == "your-api-key" ]; then
  echo -e "${RED}WARNING: Using placeholder API key. Set your OPENAI_API_KEY environment variable for actual functionality.${NC}"
  echo -e "${YELLOW}You can set it by running: export OPENAI_API_KEY=\"your-actual-key\"${NC}"
  read -p "Would you like to continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Exiting.${NC}"
    exit 1
  fi
fi

# 6. Update Kubernetes deployment file with the API key
echo -e "\n${YELLOW}Updating Kubernetes deployment with API key...${NC}"
# Create a backup
cp "kubernetes-deploy.yaml" "kubernetes-deploy.yaml.bak"
# Use a more macOS-compatible way to update the API key
TEMP_FILE=$(mktemp)
cat "kubernetes-deploy.yaml" | sed "s|value: \"your-api-key\"|value: \"$OPENAI_API_KEY\"|g" > "$TEMP_FILE"
mv "$TEMP_FILE" "kubernetes-deploy.yaml"
echo -e "${GREEN}Kubernetes deployment updated.${NC}"

# 7. Deploy to Kubernetes
echo -e "\n${YELLOW}Deploying to Kubernetes...${NC}"
kubectl apply -f kubernetes-deploy.yaml
echo -e "${GREEN}Deployment applied to Kubernetes.${NC}"

# 8. Wait for pods to be ready
echo -e "\n${YELLOW}Waiting for pod to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=minima-backend --timeout=120s
echo -e "${GREEN}Backend pod is ready!${NC}"

# 9. Get the NodePort information
NODE_PORT=$(kubectl get service minima-backend -o jsonpath='{.spec.ports[0].nodePort}')
if [ -n "$NODE_PORT" ]; then
  echo -e "${GREEN}Backend service is available on port: $NODE_PORT${NC}"
  echo -e "${YELLOW}The URL should be approximately: http://127.0.0.1:$NODE_PORT${NC}"
fi

# 10. Start the minikube service
echo -e "\n${YELLOW}Starting minikube service tunnel...${NC}"
echo -e "${YELLOW}Keep this terminal open to maintain the connection to the service.${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the service when done.${NC}"

# Run minikube service
minikube service minima-backend --url 