import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, Eye } from 'lucide-react';

const WeatherChart = () => {
  const [weatherData, setWeatherData] = useState([
    { time: '00:00', temperature: 15, humidity: 68, rainfall: 0.5, windSpeed: 12, visibility: 8.5 },
    { time: '04:00', temperature: 13, humidity: 72, rainfall: 1.2, windSpeed: 15, visibility: 7.2 },
    { time: '08:00', temperature: 16, humidity: 65, rainfall: 0.8, windSpeed: 18, visibility: 9.1 },
    { time: '12:00', temperature: 22, humidity: 58, rainfall: 0.0, windSpeed: 22, visibility: 12.5 },
    { time: '16:00', temperature: 25, humidity: 55, rainfall: 0.0, windSpeed: 20, visibility: 14.2 },
    { time: '20:00', temperature: 19, humidity: 63, rainfall: 2.1, windSpeed: 16, visibility: 6.8 },
    { time: '24:00', temperature: 17, humidity: 69, rainfall: 1.5, windSpeed: 14, visibility: 8.0 }
  ]);

  const [currentWeather, setCurrentWeather] = useState({
    temperature: 18,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 16,
    rainfall: 1.2,
    visibility: 8.5,
    pressure: 1013.2,
    lastUpdated: '2 minutes ago'
  });

  const [selectedView, setSelectedView] = useState('overview');

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun size={24} color="#f59e0b" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud size={24} color="#6b7280" />;
      case 'rainy':
      case 'rain':
        return <CloudRain size={24} color="#3b82f6" />;
      default:
        return <Cloud size={24} color="#6b7280" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 bg-opacity-90 p-3 rounded-lg border border-gray-600 text-white">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${getUnit(entry.dataKey)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getUnit = (dataKey) => {
    switch (dataKey) {
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'rainfall': return 'mm';
      case 'windSpeed': return ' km/h';
      case 'visibility': return ' km';
      case 'pressure': return ' hPa';
      default: return '';
    }
  };

  const WeatherStat = ({ icon, label, value, unit, color }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '8px',
      border: '1px solid #475569'
    }}>
      <div style={{ marginRight: '10px', color }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{label}</div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
          {value}{unit}
        </div>
      </div>
    </div>
  );

  return (
    <div className="weather-chart-container" style={{
      height: '100%',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div className="weather-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #475569',
        paddingBottom: '15px'
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            {getWeatherIcon(currentWeather.condition)}
            <span style={{ marginLeft: '10px' }}>Weather Monitoring</span>
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Environmental conditions affecting rockfall risk
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '10px 15px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          border: '1px solid #3b82f6'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {currentWeather.temperature}°C
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {currentWeather.condition}
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
            Updated {currentWeather.lastUpdated}
          </div>
        </div>
      </div>

      {/* Current Weather Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <WeatherStat
          icon={<Thermometer size={20} />}
          label="Temperature"
          value={currentWeather.temperature}
          unit="°C"
          color="#f59e0b"
        />
        <WeatherStat
          icon={<Droplets size={20} />}
          label="Humidity"
          value={currentWeather.humidity}
          unit="%"
          color="#3b82f6"
        />
        <WeatherStat
          icon={<CloudRain size={20} />}
          label="Rainfall"
          value={currentWeather.rainfall}
          unit="mm"
          color="#06b6d4"
        />
        <WeatherStat
          icon={<Wind size={20} />}
          label="Wind Speed"
          value={currentWeather.windSpeed}
          unit=" km/h"
          color="#8b5cf6"
        />
        <WeatherStat
          icon={<Eye size={20} />}
          label="Visibility"
          value={currentWeather.visibility}
          unit=" km"
          color="#10b981"
        />
      </div>

      {/* Chart Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '15px',
        justifyContent: 'center'
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'temperature', label: 'Temperature' },
          { key: 'rainfall', label: 'Rainfall' },
          { key: 'wind', label: 'Wind & Visibility' }
        ].map((view) => (
          <button
            key={view.key}
            onClick={() => setSelectedView(view.key)}
            style={{
              padding: '6px 12px',
              background: selectedView === view.key ? '#3b82f6' : '#475569',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Weather Chart */}
      <div style={{ flex: 1, minHeight: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {selectedView === 'overview' && (
            <ComposedChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={10}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                yAxisId="temp"
                stroke="#94a3b8" 
                fontSize={10}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                yAxisId="rain"
                orientation="right"
                stroke="#94a3b8" 
                fontSize={10}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="rain" dataKey="rainfall" fill="#3b82f6" opacity={0.6} />
              <Line 
                yAxisId="temp"
                type="monotone" 
                dataKey="temperature" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
              />
            </ComposedChart>
          )}
          
          {selectedView === 'temperature' && (
            <LineChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          )}

          {selectedView === 'rainfall' && (
            <BarChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rainfall" fill="#3b82f6" />
            </BarChart>
          )}

          {selectedView === 'wind' && (
            <ComposedChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} />
              <YAxis stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="visibility"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherChart;
