import React from 'react';
import './ActivityList.css';
import { 
  Box, 
  Typography, 
  IconButton,
  Chip,
  Stack,
  Paper
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const RegularActivityList = React.memo(({ activities, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'ongoing': return 'warning';
      case 'planned': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="activity-list">
      {activities.map((activity, index) => (
        <Paper 
          key={activity.activity_id || `activity-${index}`}
          className="activity-card"
          sx={{
            mb: 2,
            p: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3
            }
          }}
        >
          <div className="activity-header">
            <div className="activity-header-left">
              <h3 className="activity-title">{activity.title}</h3>
              <span className={`status-badge ${activity.status}`}>
                {activity.status}
              </span>
            </div>
            <div className="activity-actions">
              <IconButton onClick={() => onEdit(activity)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton onClick={() => {
                console.log('Regular activity being deleted:', activity);
                onDelete(activity.activity_id);
              }}>
                <Delete fontSize="small" />
              </IconButton>
            </div>
          </div>

          <div className="activity-content">
            <p className="activity-description">{activity.description}</p>
            <div className="activity-meta">
              <span className="activity-date">
                {formatDate(activity.date)}
              </span>
              {activity.leetcode_rating && (
                <span className="activity-rating">
                  Rating: {activity.leetcode_rating}
                </span>
              )}
            </div>
          </div>
        </Paper>
      ))}
    </div>
  );
});

export default RegularActivityList; 