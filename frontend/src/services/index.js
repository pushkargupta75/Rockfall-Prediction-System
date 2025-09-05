import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Services
export const apiServices = {
  // Prediction endpoints
  predictions: {
    getRiskPredictions: () => apiClient.get('/predictions/risk'),
    uploadData: (formData) => apiClient.post('/predictions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getHistoricalData: (params) => apiClient.get('/predictions/history', { params }),
  },

  // Weather endpoints
  weather: {
    getCurrentWeather: () => apiClient.get('/weather/current'),
    getForecast: (days = 7) => apiClient.get(`/weather/forecast?days=${days}`),
    getHistoricalWeather: (startDate, endDate) => 
      apiClient.get(`/weather/history?start=${startDate}&end=${endDate}`),
  },

  // Alert endpoints
  alerts: {
    getActiveAlerts: () => apiClient.get('/alerts/active'),
    createAlert: (alertData) => apiClient.post('/alerts', alertData),
    updateAlert: (id, alertData) => apiClient.put(`/alerts/${id}`, alertData),
    deleteAlert: (id) => apiClient.delete(`/alerts/${id}`),
  },

  // Resource management
  resources: {
    getAllocation: () => apiClient.get('/resources/allocation'),
    updateAllocation: (resourceData) => apiClient.put('/resources/allocation', resourceData),
    getAvailable: () => apiClient.get('/resources/available'),
  },

  // System health
  system: {
    getHealth: () => apiClient.get('/system/health'),
    getMetrics: () => apiClient.get('/system/metrics'),
    getLogs: (level = 'info') => apiClient.get(`/system/logs?level=${level}`),
  },

  // Emergency messages
  messages: {
    getMessages: (priority) => apiClient.get(`/messages?priority=${priority || ''}`),
    sendMessage: (messageData) => apiClient.post('/messages', messageData),
    markAsRead: (id) => apiClient.patch(`/messages/${id}/read`),
  }
};

// Mock data for development (when API is not available)
export const mockData = {
  riskZones: [
    {
      id: 1,
      name: 'High Risk Zone',
      position: [28.2380, 83.9956],
      riskLevel: 'HIGH',
      radius: 5000,
      color: '#ff4444',
      description: 'Detected 50 minutes ago, Confidence: 94.0%'
    },
    {
      id: 2,
      name: 'Critical Risk Zone',
      position: [28.2500, 84.0100],
      riskLevel: 'CRITICAL',
      radius: 3000,
      color: '#cc0000',
      description: 'Detected 15 minutes ago, Confidence: 89.0%'
    }
  ],
  
  weatherData: [
    { time: '00:00', temperature: 15, humidity: 68, rainfall: 0.5, windSpeed: 12 },
    { time: '04:00', temperature: 13, humidity: 72, rainfall: 1.2, windSpeed: 15 },
    { time: '08:00', temperature: 16, humidity: 65, rainfall: 0.8, windSpeed: 18 },
    { time: '12:00', temperature: 22, humidity: 58, rainfall: 0.0, windSpeed: 22 },
  ],
  
  alerts: [
    {
      id: 1,
      type: 'CRITICAL',
      message: 'Building collapse detected',
      time: '5 minutes ago',
      location: 'Zone Alpha'
    }
  ]
};

export default apiServices;
