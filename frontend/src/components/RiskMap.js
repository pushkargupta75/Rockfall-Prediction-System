import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RiskMap = () => {
  const [riskZones, setRiskZones] = useState([
    {
      id: 1,
      name: 'High Risk Zone',
      position: [28.2380, 83.9956], // Example coordinates for Nepal
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
    },
    {
      id: 3,
      name: 'Safe Zone',
      position: [28.2200, 83.9800],
      riskLevel: 'SAFE',
      radius: 2000,
      color: '#00cc44',
      description: 'Processing satellite data...'
    }
  ]);

  const [center, setCenter] = useState([28.2380, 83.9956]);
  const [zoom, setZoom] = useState(12);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return '#cc0000';
      case 'HIGH': return '#ff4444';
      case 'MEDIUM': return '#ffaa00';
      case 'SAFE': return '#00cc44';
      default: return '#888888';
    }
  };

  const getRiskOpacity = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return 0.8;
      case 'HIGH': return 0.6;
      case 'MEDIUM': return 0.4;
      case 'SAFE': return 0.3;
      default: return 0.2;
    }
  };

  return (
    <div className="risk-map-container" style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div className="map-header" style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(30, 41, 59, 0.9)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        Disaster Zone Map
        <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '5px' }}>
          Real-time satellite analysis & route optimization
        </div>
      </div>

      <div className="map-legend" style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'rgba(30, 41, 59, 0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Risk Levels</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#cc0000', borderRadius: '50%', marginRight: '8px' }}></div>
          Critical Risk
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ff4444', borderRadius: '50%', marginRight: '8px' }}></div>
          High Risk
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ffaa00', borderRadius: '50%', marginRight: '8px' }}></div>
          Medium Risk
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#00cc44', borderRadius: '50%', marginRight: '8px' }}></div>
          Safe Zone
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {riskZones.map((zone) => (
          <React.Fragment key={zone.id}>
            <Circle
              center={zone.position}
              radius={zone.radius}
              fillColor={getRiskColor(zone.riskLevel)}
              fillOpacity={getRiskOpacity(zone.riskLevel)}
              color={getRiskColor(zone.riskLevel)}
              weight={2}
            />
            <Marker position={zone.position}>
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: getRiskColor(zone.riskLevel) }}>
                    {zone.name}
                  </h3>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    <strong>Risk Level:</strong> {zone.riskLevel}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    {zone.description}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    <strong>Coordinates:</strong> {zone.position[0].toFixed(4)}, {zone.position[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default RiskMap;
