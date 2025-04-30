# Frontend Dockerfile for minimaLLM (Vite/React)
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci --force; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g --force pnpm && pnpm install --force; \
    elif [ -f yarn.lock ]; then yarn install; \
    else npm install --force; fi

# Copy the rest of the application code, including .env
COPY . .

# --- Optional DEBUG: Verify .env content before build ---
# RUN echo "--- Contents of .env file: ---" && cat .env || echo ".env file not found"
# --- END DEBUG ---

# Build the frontend
RUN npm run build

# Serve with a lightweight web server
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
