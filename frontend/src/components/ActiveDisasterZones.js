import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Activity, Bell, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

const ActiveDisasterZones = () => {
  const [activeZones, setActiveZones] = useState([
    {
      id: 1,
      type: 'Flood',
      severity: 'HIGH',
      location: 'Northern District',
      detected: '50 minutes ago',
      confidence: 94.0,
      status: 'active',
      responders: 12,
      evacuated: 45,
      affected: 200
    },
    {
      id: 2,
      type: 'Fire',
      severity: 'CRITICAL',
      location: 'Eastern Slopes',
      detected: '15 minutes ago',
      confidence: 89.0,
      status: 'active',
      responders: 8,
      evacuated: 23,
      affected: 150
    },
    {
      id: 3,
      type: 'Landslide',
      severity: 'MEDIUM',
      location: 'Central Valley',
      detected: '2 hours ago',
      confidence: 76.5,
      status: 'monitoring',
      responders: 4,
      evacuated: 0,
      affected: 80
    }
  ]);

  const [systemStatus, setSystemStatus] = useState({
    cvModel: { status: 'online', lastUpdate: '4:30:52 PM' },
    nlpModel: { status: 'online', lastUpdate: '4:30:45 PM' },
    routeOptimizer: { status: 'processing', lastUpdate: '4:30:51 PM' },
    resourcePredictor: { status: 'online', lastUpdate: '4:30:48 PM' }
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#d97706';
      case 'LOW': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'rgba(220, 38, 38, 0.1)';
      case 'HIGH': return 'rgba(234, 88, 12, 0.1)';
      case 'MEDIUM': return 'rgba(217, 119, 6, 0.1)';
      case 'LOW': return 'rgba(22, 163, 74, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle size={14} color="#16a34a" />;
      case 'offline': return <XCircle size={14} color="#dc2626" />;
      case 'processing': return <Clock size={14} color="#d97706" />;
      default: return <Activity size={14} color="#6b7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#16a34a';
      case 'offline': return '#dc2626';
      case 'processing': return '#d97706';
      default: return '#6b7280';
    }
  };

  const DisasterZoneCard = ({ zone }) => (
    <div style={{
      background: getSeverityBg(zone.severity),
      border: `1px solid ${getSeverityColor(zone.severity)}`,
      borderLeft: `4px solid ${getSeverityColor(zone.severity)}`,
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '12px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AlertTriangle 
            size={18} 
            color={getSeverityColor(zone.severity)} 
            style={{ marginRight: '8px' }}
          />
          <div>
            <h4 style={{ 
              margin: 0, 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: 'white' 
            }}>
              {zone.type} - {zone.severity} Severity
            </h4>
            <p style={{ 
              margin: '2px 0 0 0', 
              fontSize: '11px', 
              color: '#94a3b8' 
            }}>
              {zone.location}
            </p>
          </div>
        </div>
        <span style={{
          padding: '3px 8px',
          background: getSeverityColor(zone.severity),
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          {zone.severity}
        </span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '10px'
      }}>
        <div style={{ fontSize: '11px' }}>
          <span style={{ color: '#94a3b8' }}>Detected: </span>
          <span style={{ color: 'white' }}>{zone.detected}</span>
        </div>
        <div style={{ fontSize: '11px' }}>
          <span style={{ color: '#94a3b8' }}>Confidence: </span>
          <span style={{ color: 'white' }}>{zone.confidence}%</span>
        </div>
        <div style={{ fontSize: '11px' }}>
          <span style={{ color: '#94a3b8' }}>Responders: </span>
          <span style={{ color: 'white' }}>{zone.responders}</span>
        </div>
        <div style={{ fontSize: '11px' }}>
          <span style={{ color: '#94a3b8' }}>Affected: </span>
          <span style={{ color: 'white' }}>{zone.affected}</span>
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '10px',
        color: '#94a3b8'
      }}>
        Status: {zone.status === 'active' ? 'Active Response' : 'Under Monitoring'}
        {zone.evacuated > 0 && (
          <span style={{ marginLeft: '10px', color: '#10b981' }}>
            {zone.evacuated} evacuated
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="active-disaster-zones-container" style={{
      height: '100%',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div className="zones-header" style={{
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
            <Shield size={20} style={{ marginRight: '8px', color: '#ef4444' }} />
            Active Disaster Zones
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            AI-detected threats requiring immediate attention
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '6px',
          border: '1px solid #ef4444',
          fontSize: '12px'
        }}>
          <Bell size={14} color="#ef4444" />
          {activeZones.filter(z => z.severity === 'CRITICAL' || z.severity === 'HIGH').length} High Priority
        </div>
      </div>

      {/* Active Zones List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        marginBottom: '20px',
        maxHeight: '300px'
      }}>
        {activeZones.map((zone) => (
          <DisasterZoneCard key={zone.id} zone={zone} />
        ))}
      </div>

      {/* System Status */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #475569'
      }}>
        <h4 style={{ 
          margin: '0 0 15px 0', 
          fontSize: '14px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          color: '#e2e8f0'
        }}>
          <Activity size={16} style={{ marginRight: '8px', color: '#60a5fa' }} />
          System Status
          <span style={{ 
            marginLeft: 'auto',
            fontSize: '10px',
            color: '#94a3b8'
          }}>
            Last Update: 4:30:52 PM
          </span>
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          {Object.entries(systemStatus).map(([key, status]) => (
            <div key={key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '6px',
              border: `1px solid ${getStatusColor(status.status)}20`
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getStatusIcon(status.status)}
                <span style={{ 
                  marginLeft: '8px', 
                  fontSize: '12px', 
                  fontWeight: 'medium',
                  color: 'white'
                }}>
                  {key === 'cvModel' ? 'CV Model' :
                   key === 'nlpModel' ? 'NLP Model' :
                   key === 'routeOptimizer' ? 'Route Optimizer' :
                   'Resource Predictor'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: 'bold',
                  color: getStatusColor(status.status),
                  textTransform: 'uppercase'
                }}>
                  {status.status}
                </div>
                <div style={{ 
                  fontSize: '9px', 
                  color: '#94a3b8'
                }}>
                  {status.lastUpdate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveDisasterZones;
