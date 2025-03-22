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

const DailyActivityList = React.memo(({ daily_activities_prop, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
//here activities is just a prop but inside it the objects are of belonging to daily_activities
  return (
    <div className="activity-list">
      {daily_activities_prop.map((activity, index) => (
        <Paper 
          key={activity.daily_activity_id || `daily-activity-${index}`}
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
            </div>
            <div className="activity-actions">
              <IconButton onClick={() => onEdit(activity)}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton onClick={() => {
                console.log('Daily activity being deleted:', activity);
                onDelete(activity.daily_activity_id);
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
            </div>
          </div>
        </Paper>
      ))}
    </div>
  );
});

export default DailyActivityList; 