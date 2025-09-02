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
COPY services/api_gateway/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY services/common /app/services/common
COPY services/api_gateway /app/services/api_gateway

# Set environment variables
ENV PYTHONPATH=/app
ENV MODULE_NAME=services.api_gateway.main
ENV VARIABLE_NAME=app
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "services.api_gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]
