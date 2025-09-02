# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only the requirements file first
COPY services/prediction_service/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy model files
COPY services/prediction_service/models /app/services/prediction_service/models

# Copy the rest of the application code
COPY services/common /app/services/common
COPY services/prediction_service /app/services/prediction_service

# Set environment variables
ENV PYTHONPATH=/app
ENV MODULE_NAME=services.prediction_service.main
ENV VARIABLE_NAME=app
ENV PORT=8001

# Expose the port
EXPOSE 8001

# Run with uvicorn
CMD ["uvicorn", "services.prediction_service.main:app", "--host", "0.0.0.0", "--port", "8001"]
