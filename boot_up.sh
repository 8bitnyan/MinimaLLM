#!/bin/bash

set -e  # Exit on error

# Define colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting minimaLLM Application...${NC}"
echo -e "${YELLOW}====================================${NC}"

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
cd backend
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
sed -i.bak "s|value: \"your-api-key\"|value: \"$OPENAI_API_KEY\"|g" kubernetes-deploy.yaml
echo -e "${GREEN}Kubernetes deployment updated.${NC}"

# 7. Deploy to Kubernetes
echo -e "\n${YELLOW}Deploying to Kubernetes...${NC}"
kubectl apply -f kubernetes-deploy.yaml
echo -e "${GREEN}Deployment applied to Kubernetes.${NC}"

# 8. Wait for pods to be ready
echo -e "\n${YELLOW}Waiting for pod to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=minima-backend --timeout=120s
echo -e "${GREEN}Backend pod is ready!${NC}"

# 9. Get the service URL - more reliable method
echo -e "\n${YELLOW}Getting backend service URL...${NC}"
# Create a temporary file to store the service URL
SERVICE_URL_OUTPUT=$(mktemp)

# Start minikube service in a new terminal window that will stay open
echo -e "${YELLOW}Opening service tunnel in a new terminal window...${NC}"
osascript -e 'tell application "Terminal" to do script "echo \"Service tunnel started. Keep this window open while using the app.\"; minikube service minima-backend --url"'

# Wait a moment for the service to start
echo -e "${YELLOW}Waiting for service URL to be available...${NC}"
sleep 5

# Try to get the URL from Minikube (this will be approximate)
NODE_PORT=$(kubectl get service minima-backend -o jsonpath='{.spec.ports[0].nodePort}')
if [ -n "$NODE_PORT" ]; then
  BACKEND_URL="http://127.0.0.1:$NODE_PORT"
  echo -e "${GREEN}Backend service should be available at approximately: $BACKEND_URL${NC}"
  echo -e "${YELLOW}Note: The actual URL may be different. Check the terminal window that opened.${NC}"
else
  echo -e "${RED}Could not determine NodePort. Using fallback port.${NC}"
  BACKEND_URL="http://127.0.0.1:8000"
fi

# Prompt user to enter the correct URL
echo
echo -e "${YELLOW}IMPORTANT: Please check the URL in the new terminal window that opened${NC}"
read -p "Enter the correct backend URL shown in the terminal: " USER_URL
if [ -n "$USER_URL" ]; then
  BACKEND_URL=$USER_URL
  echo -e "${GREEN}Using backend URL: $BACKEND_URL${NC}"
fi

# 10. Update the Flutter API service with the correct backend URL
echo -e "\n${YELLOW}Updating Flutter API service with backend URL...${NC}"
cd ../frontend
APISERVICE_FILE="lib/services/api_service.dart"
# Create a backup
cp "$APISERVICE_FILE" "${APISERVICE_FILE}.bak"

# Use a more macOS-compatible way to update the baseUrl
# First, create a temp file with the changes
TEMP_FILE=$(mktemp)
cat "$APISERVICE_FILE" | sed "s|baseUrl = \"http://[^\"]*\"|baseUrl = \"$BACKEND_URL\"|g" > "$TEMP_FILE"
# Then move the temp file to replace the original
mv "$TEMP_FILE" "$APISERVICE_FILE"

echo -e "${GREEN}Flutter API service updated to use: $BACKEND_URL${NC}"

# 11. Start Flutter web app in Chrome
echo -e "\n${YELLOW}Starting Flutter web app...${NC}"
if ! command -v flutter &> /dev/null; then
  echo -e "${RED}Flutter command not found. Please make sure Flutter is installed and in your PATH.${NC}"
  echo -e "${YELLOW}Visit https://flutter.dev/docs/get-started/install to install Flutter.${NC}"
  exit 1
fi

# Check if Chrome is installed
if [ "$(uname)" == "Darwin" ]; then  # macOS
  if [ ! -d "/Applications/Google Chrome.app" ]; then
    echo -e "${RED}Google Chrome not found. Please install Chrome to run the Flutter web app.${NC}"
    exit 1
  fi
fi

# Run Flutter web app
echo -e "${YELLOW}Launching Flutter web app in Chrome...${NC}"
flutter run -d chrome

# Note: The script will remain here until the Flutter app is closed

# 12. Cleanup
echo -e "\n${YELLOW}Cleaning up...${NC}"
# Restore original API service file if backup exists
if [ -f "${APISERVICE_FILE}.bak" ]; then
  mv "${APISERVICE_FILE}.bak" "${APISERVICE_FILE}"
  echo -e "${GREEN}Restored original API service file.${NC}"
fi

echo -e "\n${GREEN}MinimaLLM shutdown complete.${NC}"
echo -e "${YELLOW}Note: The backend service is still running. To stop it, close the terminal window with the service tunnel.${NC}"
echo -e "${YELLOW}To delete the Kubernetes deployment, run: kubectl delete -f backend/kubernetes-deploy.yaml${NC}" 