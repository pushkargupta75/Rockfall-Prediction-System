import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';

const CrackTimeline = () => {
  const [timelineData, setTimelineData] = useState([
    { time: '00:00', cracks: 12, severity: 2.1, timestamp: '2025-09-06 00:00' },
    { time: '04:00', cracks: 15, severity: 2.8, timestamp: '2025-09-06 04:00' },
    { time: '08:00', cracks: 18, severity: 3.2, timestamp: '2025-09-06 08:00' },
    { time: '12:00', cracks: 25, severity: 4.1, timestamp: '2025-09-06 12:00' },
    { time: '16:00', cracks: 32, severity: 5.2, timestamp: '2025-09-06 16:00' },
    { time: '20:00', cracks: 28, severity: 4.8, timestamp: '2025-09-06 20:00' },
    { time: '24:00', cracks: 35, severity: 6.1, timestamp: '2025-09-06 24:00' }
  ]);

  const [selectedMetric, setSelectedMetric] = useState('cracks');
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'CRITICAL',
      message: 'Crack expansion detected in Zone Alpha',
      time: '5 minutes ago',
      severity: 'critical'
    },
    {
      id: 2,
      type: 'HIGH',
      message: 'New crack formation in monitoring area',
      time: '15 minutes ago',
      severity: 'high'
    },
    {
      id: 3,
      type: 'MEDIUM',
      message: 'Increased seismic activity detected',
      time: '32 minutes ago',
      severity: 'medium'
    }
  ]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      default: return '#65a3be';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 bg-opacity-90 p-3 rounded-lg border border-gray-600 text-white">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey === 'cracks' ? 'Cracks Detected' : 'Severity Level'}: ${entry.value}${entry.dataKey === 'severity' ? '/10' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="crack-timeline-container" style={{
      height: '100%',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div className="timeline-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #475569',
        paddingBottom: '15px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <TrendingUp size={20} style={{ marginRight: '8px', color: '#60a5fa' }} />
            Crack Detection Timeline
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Real-time monitoring and trend analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setSelectedMetric('cracks')}
            style={{
              padding: '6px 12px',
              background: selectedMetric === 'cracks' ? '#3b82f6' : '#475569',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Crack Count
          </button>
          <button
            onClick={() => setSelectedMetric('severity')}
            style={{
              padding: '6px 12px',
              background: selectedMetric === 'severity' ? '#3b82f6' : '#475569',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Severity
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: '250px', marginBottom: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {selectedMetric === 'cracks' ? (
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="crackGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={12}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cracks"
                stroke="#60a5fa"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#crackGradient)"
              />
            </AreaChart>
          ) : (
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={12}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tick={{ fill: '#94a3b8' }}
                domain={[0, 10]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="severity"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#f59e0b' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Recent Alerts */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '8px',
        padding: '15px'
      }}>
        <h4 style={{ 
          margin: '0 0 15px 0', 
          fontSize: '14px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}>
          <AlertTriangle size={16} style={{ marginRight: '8px', color: '#f59e0b' }} />
          Recent Detection Events
        </h4>
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {alerts.map((alert) => (
            <div key={alert.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid #475569'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getSeverityColor(alert.severity),
                  marginRight: '10px'
                }}></div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'medium' }}>
                    {alert.message}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    <Clock size={10} style={{ marginRight: '4px' }} />
                    {alert.time}
                  </div>
                </div>
              </div>
              <span style={{
                padding: '2px 6px',
                background: getSeverityColor(alert.severity),
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                {alert.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrackTimeline;
