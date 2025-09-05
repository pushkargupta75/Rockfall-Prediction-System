# Disaster Response Command Center - Frontend

A comprehensive React dashboard for the Rockfall Prediction System, inspired by modern emergency management interfaces.

## Features

### 🗺️ Interactive Risk Map
- **Leaflet.js Integration**: Real-time disaster zone mapping
- **Risk Level Visualization**: Color-coded zones (Critical, High, Medium, Safe)
- **Interactive Markers**: Click for detailed zone information
- **Real-time Updates**: Live satellite data integration

### 📊 Advanced Analytics Dashboard
- **Active Disaster Zones**: Real-time threat monitoring
- **Emergency Messages**: NLP-classified priority communications
- **Resource Allocation**: AI-predicted needs & deployment tracking
- **Crack Timeline**: Trend analysis with severity scoring
- **Weather Monitoring**: Environmental risk factors

### 🎨 Modern UI/UX
- **Dark Theme**: Professional emergency management aesthetic
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data streams and notifications
- **Gradient Backgrounds**: Modern glassmorphism design
- **Interactive Charts**: Recharts integration for data visualization

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **Leaflet.js**: Interactive mapping and geospatial visualization
- **Recharts**: Advanced charting and data visualization
- **Lucide React**: Modern icon library
- **Axios**: HTTP client for API integration
- **React Scripts**: Development and build tooling

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Reusable React components
│   │   ├── RiskMap.js         # Interactive disaster zone map
│   │   ├── CrackTimeline.js   # Crack detection timeline
│   │   ├── WeatherChart.js    # Weather monitoring
│   │   ├── ResourceAllocation.js  # Resource management
│   │   ├── ActiveDisasterZones.js # Active threat monitoring
│   │   └── EmergencyMessages.js   # Communication center
│   ├── pages/
│   │   └── index.js        # Main dashboard page
│   ├── services/
│   │   └── index.js        # API integration services
│   ├── App.js              # Main application component
│   ├── App.css             # Global styles
│   └── index.js            # React application entry point
└── package.json            # Dependencies and scripts
```

## Components Overview

### RiskMap Component
- Real-time disaster zone visualization using Leaflet.js
- Interactive markers with popup information
- Color-coded risk levels with legend
- Satellite tile layer integration

### CrackTimeline Component
- Temporal analysis of crack detection data
- Toggle between crack count and severity metrics
- Recent alerts and detection events
- Interactive chart with custom tooltips

### WeatherChart Component
- Multi-metric weather monitoring
- Temperature, humidity, rainfall, and wind data
- Current conditions display with weather icons
- Historical trend analysis

### ResourceAllocation Component
- AI-predicted resource needs
- Current deployment status
- Zone-based allocation charts
- Resource shortage indicators

### ActiveDisasterZones Component
- Real-time threat monitoring
- Severity-based color coding
- Response team status
- System health indicators

### EmergencyMessages Component
- NLP-classified priority communications
- Real-time message feed
- Priority-based filtering
- Quick message composition

## API Integration

The frontend integrates with the backend API through the services layer:

```javascript
import { apiServices } from './services';

// Get risk predictions
const riskData = await apiServices.predictions.getRiskPredictions();

// Get weather data
const weatherData = await apiServices.weather.getCurrentWeather();

// Send emergency message
await apiServices.messages.sendMessage(messageData);
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_MAP_TILES_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## Development

### Running the Development Server

```bash
npm start
```

This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Design Inspiration

The interface is inspired by modern emergency management command centers with:

- **Professional Dark Theme**: Reduces eye strain during long operations
- **Information Hierarchy**: Critical data prominently displayed
- **Color-coded Alerts**: Intuitive severity indication
- **Responsive Layout**: Works across all device sizes
- **Real-time Updates**: Live data feeds and notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and component structure
2. Use functional components with React hooks
3. Implement responsive design principles
4. Add proper error handling and loading states
5. Test across different screen sizes

## License

This project is part of the Rockfall Prediction System and follows the same licensing terms.
