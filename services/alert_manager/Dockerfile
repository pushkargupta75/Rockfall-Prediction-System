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
COPY services/alert_manager/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY services/common /app/services/common
COPY services/alert_manager /app/services/alert_manager

# Set environment variables
ENV PYTHONPATH=/app
ENV MODULE_NAME=services.alert_manager.main
ENV VARIABLE_NAME=app
ENV PORT=8002

# Expose the port
EXPOSE 8002

# Run with uvicorn
CMD ["uvicorn", "services.alert_manager.main:app", "--host", "0.0.0.0", "--port", "8002"]
