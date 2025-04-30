# Backend Dockerfile for minimaLLM (Flask)
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose port (default Flask port)
EXPOSE 5000

# Set environment variables (override in Kubernetes as needed)
ENV PYTHONUNBUFFERED=1

# Run the backend
CMD ["python", "run.py"]
