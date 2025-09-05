import React, { useState, useEffect } from 'react';
import RiskMap from '../components/RiskMap';
import CrackTimeline from '../components/CrackTimeline';
import WeatherChart from '../components/WeatherChart';
import ResourceAllocation from '../components/ResourceAllocation';
import ActiveDisasterZones from '../components/ActiveDisasterZones';
import EmergencyMessages from '../components/EmergencyMessages';
import { AlertTriangle, Shield, Activity, Zap, Settings, Maximize2 } from 'lucide-react';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemHealth, setSystemHealth] = useState({
    overall: 'operational',
    alerts: 3,
    activeIncidents: 2,
    systemLoad: 78
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #475569',
        padding: '15px 30px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              padding: '8px',
              borderRadius: '8px',
              marginRight: '15px'
            }}>
              <AlertTriangle size={24} color="white" />
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Disaster Response Command Center
              </h1>
              <p style={{ 
                margin: '2px 0 0 0', 
                fontSize: '14px', 
                color: '#94a3b8' 
              }}>
                AI-Powered Emergency Management System
              </p>
            </div>
          </div>

          {/* System Status and Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Navigation Tabs */}
            <nav style={{ display: 'flex', gap: '5px' }}>
              {[
                { icon: Shield, label: 'Command Center', active: true },
                { icon: Activity, label: 'Data Ingestion' },
                { icon: Zap, label: 'Model Training' },
                { icon: Settings, label: 'Simulation' }
              ].map((tab, index) => (
                <button
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    background: tab.active ? '#ef4444' : 'transparent',
                    border: tab.active ? '1px solid #ef4444' : '1px solid #475569',
                    borderRadius: '6px',
                    color: tab.active ? 'white' : '#94a3b8',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <tab.icon size={14} style={{ marginRight: '6px' }} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* System Status Indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '8px 15px',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: '8px',
              border: '1px solid #475569'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></div>
                <span style={{ fontSize: '12px', color: '#10b981' }}>CV Model: Online</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></div>
                <span style={{ fontSize: '12px', color: '#10b981' }}>NLP Model: Online</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b'
                }}></div>
                <span style={{ fontSize: '12px', color: '#f59e0b' }}>Route Optimizer: Processing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></div>
                <span style={{ fontSize: '12px', color: '#10b981' }}>Resource Predictor: Online</span>
              </div>
            </div>

            {/* Time Display */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: 'white' 
              }}>
                {formatTime(currentTime)}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#94a3b8' 
              }}>
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main style={{ 
        padding: '20px 30px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr 350px',
        gridTemplateRows: 'auto 1fr',
        gap: '20px',
        height: 'calc(100vh - 120px)'
      }}>
        {/* Left Sidebar - Active Zones and Messages */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          gridRow: '1 / 3'
        }}>
          <div style={{ height: '45%' }}>
            <ActiveDisasterZones />
          </div>
          <div style={{ height: '55%' }}>
            <EmergencyMessages />
          </div>
        </div>

        {/* Center - Main Map */}
        <div style={{ 
          gridRow: '1 / 3',
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '12px',
          border: '1px solid #475569',
          overflow: 'hidden'
        }}>
          <RiskMap />
        </div>

        {/* Right Sidebar - Charts and Analytics */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          gridRow: '1 / 3'
        }}>
          <div style={{ height: '33%' }}>
            <ResourceAllocation />
          </div>
          <div style={{ height: '33%' }}>
            <CrackTimeline />
          </div>
          <div style={{ height: '34%' }}>
            <WeatherChart />
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer style={{
        background: 'rgba(30, 41, 59, 0.95)',
        borderTop: '1px solid #475569',
        padding: '10px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>System Load: {systemHealth.systemLoad}%</span>
          <span>Active Incidents: {systemHealth.activeIncidents}</span>
          <span>Pending Alerts: {systemHealth.alerts}</span>
        </div>
        <div>
          Last Update: {formatTime(currentTime)}
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
