import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Truck, Users, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const ResourceAllocation = () => {
  const [resourceData, setResourceData] = useState({
    medical: {
      current: 75,
      estimated: 200,
      allocated: 125,
      needed: 125,
      status: 'shortage',
      zone: 'Alpha'
    },
    rescue: {
      current: 4,
      estimated: 12,
      allocated: 8,
      needed: 8,
      status: 'shortage',
      zone: 'Beta'
    },
    shelter: {
      current: 200,
      estimated: 800,
      allocated: 600,
      needed: 600,
      status: 'adequate',
      zone: 'Gamma'
    }
  });

  const [deploymentStatus, setDeploymentStatus] = useState([
    { name: 'Medical Teams', deployed: 8, available: 12, total: 20 },
    { name: 'Rescue Units', deployed: 6, available: 4, total: 10 },
    { name: 'Emergency Supplies', deployed: 65, available: 35, total: 100 },
    { name: 'Transport Vehicles', deployed: 15, available: 10, total: 25 }
  ]);

  const [allocationChart, setAllocationChart] = useState([
    { name: 'Zone Alpha', medical: 75, rescue: 4, shelter: 150, priority: 'high' },
    { name: 'Zone Beta', medical: 45, rescue: 2, shelter: 80, priority: 'critical' },
    { name: 'Zone Gamma', medical: 30, rescue: 3, shelter: 200, priority: 'medium' },
    { name: 'Zone Delta', medical: 20, rescue: 1, shelter: 100, priority: 'low' }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortage': return '#dc2626';
      case 'adequate': return '#16a34a';
      case 'surplus': return '#2563eb';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shortage': return <AlertCircle size={16} color="#dc2626" />;
      case 'adequate': return <CheckCircle size={16} color="#16a34a" />;
      case 'surplus': return <TrendingUp size={16} color="#2563eb" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  const ResourceCard = ({ title, icon, data, unit = '' }) => (
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)',
      borderRadius: '8px',
      padding: '15px',
      border: `1px solid ${getStatusColor(data.status)}`,
      borderLeft: `4px solid ${getStatusColor(data.status)}`
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '8px', color: '#60a5fa' }}>
            {icon}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
              {title}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>
              Zone {data.zone}
            </p>
          </div>
        </div>
        {getStatusIcon(data.status)}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '20px', 
          fontWeight: 'bold',
          color: 'white'
        }}>
          <span>{data.current}</span>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>/ {data.estimated}</span>
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          Current / Estimated Need
        </div>
      </div>

      <div style={{
        background: '#374151',
        borderRadius: '6px',
        height: '6px',
        marginBottom: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: getStatusColor(data.status),
          height: '100%',
          width: `${Math.min((data.current / data.estimated) * 100, 100)}%`,
          transition: 'width 0.3s ease'
        }}></div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#94a3b8'
      }}>
        <span>{Math.round((data.current / data.estimated) * 100)}% allocated</span>
        <span>{data.needed} needed</span>
      </div>
    </div>
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="resource-allocation-container" style={{
      height: '100%',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div className="resource-header" style={{
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
            <Package size={20} style={{ marginRight: '8px', color: '#60a5fa' }} />
            Resource Allocation
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            AI-predicted needs & current deployment
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '6px',
          border: '1px solid #10b981',
          fontSize: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981'
          }}></div>
          Resource Predictor: Online
        </div>
      </div>

      {/* Resource Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <ResourceCard
          title="Medical Resources"
          icon={<Users size={18} />}
          data={resourceData.medical}
          unit="personnel"
        />
        <ResourceCard
          title="Rescue Resources"
          icon={<Truck size={18} />}
          data={resourceData.rescue}
          unit="teams"
        />
        <ResourceCard
          title="Shelter Resources"
          icon={<Package size={18} />}
          data={resourceData.shelter}
          unit="units"
        />
      </div>

      {/* Deployment Chart */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        flex: 1
      }}>
        {/* Zone Allocation Chart */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#e2e8f0'
          }}>
            Resource Distribution by Zone
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={allocationChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={10}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: 'white'
                }}
              />
              <Bar dataKey="medical" fill="#3b82f6" />
              <Bar dataKey="rescue" fill="#10b981" />
              <Bar dataKey="shelter" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Deployment Status */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.3)',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#e2e8f0'
          }}>
            Current Deployment Status
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {deploymentStatus.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '6px',
                border: '1px solid #475569'
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'medium', color: 'white' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {item.deployed} deployed, {item.available} available
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                    {Math.round((item.deployed / item.total) * 100)}%
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {item.deployed}/{item.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceAllocation;
