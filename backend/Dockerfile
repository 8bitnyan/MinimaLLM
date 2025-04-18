FROM python:3.11-slim

WORKDIR /app

# Copy requirements file and install dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy source code
COPY ./app /app/app

# Create directory for uploaded files
RUN mkdir -p /app/uploads

# Environment variables
ENV PYTHONPATH=/app
ENV PORT=8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# OpenFaaS follows port 8080 convention
EXPOSE 8000 