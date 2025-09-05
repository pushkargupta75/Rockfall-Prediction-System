import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle, User, Clock, Send } from 'lucide-react';

const EmergencyMessages = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'CRITICAL',
      priority: 96,
      title: 'Building collapse on 5th Avenue, multiple people trapped',
      category: 'Structure Collapse',
      location: 'Zone Alpha - Sector 7',
      time: '5 minutes ago',
      status: 'active',
      responder: 'Emergency Team Alpha',
      details: 'Immediate rescue operations required. Heavy machinery deployed.'
    },
    {
      id: 2,
      type: 'HIGH',
      priority: 87,
      title: 'Need medical supplies at evacuation center',
      category: 'Medical Request',
      location: 'Zone Beta - Evacuation Point 2',
      time: '10 minutes ago',
      status: 'responding',
      responder: 'Medical Unit 3',
      details: 'Urgent requirement for bandages and emergency medications.'
    },
    {
      id: 3,
      type: 'MEDIUM',
      priority: 72,
      title: 'Road blockage due to debris on Highway 12',
      category: 'Infrastructure',
      location: 'Zone Gamma - Highway Junction',
      time: '25 minutes ago',
      status: 'assigned',
      responder: 'Cleanup Crew B',
      details: 'Heavy debris blocking main evacuation route. Alternate routes activated.'
    },
    {
      id: 4,
      type: 'HIGH',
      priority: 89,
      title: 'Water contamination detected in central district',
      category: 'Environmental',
      location: 'Zone Delta - Central Water Plant',
      time: '1 hour ago',
      status: 'investigating',
      responder: 'Environmental Team 1',
      details: 'Water supply compromised. Distributing emergency water supplies.'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('HIGH');
  const [selectedCategory, setSelectedCategory] = useState('General');

  const getPriorityColor = (type) => {
    switch (type) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#d97706';
      case 'LOW': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getPriorityBg = (type) => {
    switch (type) {
      case 'CRITICAL': return 'rgba(220, 38, 38, 0.1)';
      case 'HIGH': return 'rgba(234, 88, 12, 0.1)';
      case 'MEDIUM': return 'rgba(217, 119, 6, 0.1)';
      case 'LOW': return 'rgba(22, 163, 74, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#dc2626';
      case 'responding': return '#ea580c';
      case 'assigned': return '#d97706';
      case 'investigating': return '#3b82f6';
      case 'resolved': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const MessageCard = ({ message }) => (
    <div style={{
      background: getPriorityBg(message.type),
      border: `1px solid ${getPriorityColor(message.type)}`,
      borderLeft: `4px solid ${getPriorityColor(message.type)}`,
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '12px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AlertCircle 
            size={16} 
            color={getPriorityColor(message.type)} 
            style={{ marginRight: '8px' }}
          />
          <span style={{
            padding: '2px 8px',
            background: getPriorityColor(message.type),
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white',
            marginRight: '8px'
          }}>
            {message.type}
          </span>
          <span style={{
            fontSize: '10px',
            color: '#94a3b8',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '2px 6px',
            borderRadius: '8px'
          }}>
            {message.priority}%
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: '10px', 
          color: '#94a3b8' 
        }}>
          <Clock size={12} style={{ marginRight: '4px' }} />
          {message.time}
        </div>
      </div>

      {/* Title */}
      <h4 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '13px', 
        fontWeight: 'bold', 
        color: 'white',
        lineHeight: '1.3'
      }}>
        {message.title}
      </h4>

      {/* Details */}
      <p style={{ 
        margin: '0 0 10px 0', 
        fontSize: '11px', 
        color: '#d1d5db',
        lineHeight: '1.4'
      }}>
        {message.details}
      </p>

      {/* Meta Info */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        fontSize: '10px',
        marginBottom: '10px'
      }}>
        <div>
          <span style={{ color: '#94a3b8' }}>Category: </span>
          <span style={{ color: 'white' }}>{message.category}</span>
        </div>
        <div>
          <span style={{ color: '#94a3b8' }}>Location: </span>
          <span style={{ color: 'white' }}>{message.location}</span>
        </div>
      </div>

      {/* Status and Responder */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <User size={12} style={{ marginRight: '4px', color: '#94a3b8' }} />
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            {message.responder}
          </span>
        </div>
        <span style={{
          padding: '3px 8px',
          background: getStatusColor(message.status),
          borderRadius: '12px',
          fontSize: '9px',
          fontWeight: 'bold',
          color: 'white',
          textTransform: 'capitalize'
        }}>
          {message.status}
        </span>
      </div>
    </div>
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        type: selectedPriority,
        priority: selectedPriority === 'CRITICAL' ? 95 : selectedPriority === 'HIGH' ? 85 : 70,
        title: newMessage,
        category: selectedCategory,
        location: 'Command Center',
        time: 'Just now',
        status: 'active',
        responder: 'Pending Assignment',
        details: 'New emergency message from command center.'
      };
      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

  return (
    <div className="emergency-messages-container" style={{
      height: '100%',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div className="messages-header" style={{
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
            <MessageSquare size={20} style={{ marginRight: '8px', color: '#60a5fa' }} />
            Emergency Messages
          </h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            NLP-classified priority communications
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(96, 165, 250, 0.1)',
          borderRadius: '6px',
          border: '1px solid #60a5fa',
          fontSize: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#60a5fa'
          }}></div>
          Auto-Classification Active
        </div>
      </div>

      {/* Quick Message Input */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        border: '1px solid #475569'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '10px'
        }}>
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            style={{
              padding: '6px 8px',
              background: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px'
            }}
          >
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '6px 8px',
              background: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px'
            }}
          >
            <option value="General">General</option>
            <option value="Medical Request">Medical Request</option>
            <option value="Structure Collapse">Structure Collapse</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Environmental">Environmental</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type emergency message..."
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            style={{
              padding: '8px 15px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Send size={14} style={{ marginRight: '4px' }} />
            Send
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        maxHeight: 'calc(100% - 200px)'
      }}>
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
};

export default EmergencyMessages;
