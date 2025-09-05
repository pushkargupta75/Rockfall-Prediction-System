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
COPY services/data_collector/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY services/common /app/services/common
COPY services/data_collector /app/services/data_collector

# Set environment variables
ENV PYTHONPATH=/app
ENV MODULE_NAME=services.data_collector.main
ENV VARIABLE_NAME=app

# Expose the port (if needed)
EXPOSE 8003

# Run the data collector (replace with actual entrypoint if needed)
CMD ["python", "services/data_collector/main.py"]
