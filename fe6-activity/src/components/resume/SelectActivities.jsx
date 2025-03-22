import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Paper
} from '@mui/material';
import { ActivityCard, ActivityChip, QuotaErrorAlert } from '../../pages/ResumeBuilder.styles';
import axios from 'axios';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

// Helper function to check if an error is a quota error
const isQuotaError = (errorText) => {
  if (!errorText) return false;
  
  // If it's an error object with a response property
  if (typeof errorText === 'object' && errorText.response) {
    if (errorText.response.status === 429 || errorText.response.status === 500) {
      return true;
    }
    
    // Check error message in response
    const responseError = errorText.response.data?.error || '';
    if (responseError && typeof responseError === 'string') {
      const lowerResponseError = responseError.toLowerCase();
      if (
        lowerResponseError.includes('quota') || 
        lowerResponseError.includes('limit') || 
        lowerResponseError.includes('exceed') ||
        lowerResponseError.includes('exhausted') ||
        lowerResponseError.includes('resource')
      ) {
        return true;
      }
    }
  }
  
  // If it's a string
  if (typeof errorText === 'string') {
    const lowerError = errorText.toLowerCase();
    return (
      lowerError.includes('quota') || 
      lowerError.includes('limit') || 
      lowerError.includes('exceed') ||
      lowerError.includes('exhausted') ||
      lowerError.includes('resource')
    );
  }
  
  return false;
};

const SelectActivities = ({ 
  activities, 
  selectedActivities, 
  setSelectedActivities, 
  resumeType, 
  jobTitle,
  setError,
  base_url
}) => {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Effect to recommend activities when component mounts if job-specific resume is selected
  useEffect(() => {
    if (resumeType === 'specific' && jobTitle) {
      recommendActivities();
    }
  }, [resumeType, jobTitle]);

  // Function to recommend activities based on job title
  const recommendActivities = async () => {
    try {
      setLoading(true);
      setLocalError('');
      
      const response = await axios.post(
        `${base_url}/api/activities/recommend`,
        { job_title: jobTitle },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.data && response.data.recommended_activities) {
        // Update selected activities with AI recommendations
        const recommendedActivityTitles = response.data.recommended_activities;
        
        // Find the actual activity objects that match these titles
        const recommendedActivities = activities.filter(activity => 
          recommendedActivityTitles.includes(activity.title)
        );
        
        // Update the selectedActivities state
        setSelectedActivities(recommendedActivities);
      }
    } catch (err) {
      console.error('Error fetching recommended activities:', err);
      
      // Detailed error logging
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      // Check for quota exceeded error - expanded to catch more patterns
      const errorMessage = err.response?.data?.error || err.message || '';
      const errorString = JSON.stringify(err).toLowerCase();
      
      console.log('Error message for detection:', errorMessage);
      console.log('Error string for detection:', errorString);
      
      if (err.response?.status === 429 || 
          err.response?.status === 500 ||
          errorMessage.toLowerCase().includes('quota') ||
          errorMessage.toLowerCase().includes('limit') ||
          errorMessage.toLowerCase().includes('exceed') ||
          errorMessage.toLowerCase().includes('exhausted') ||
          errorMessage.toLowerCase().includes('resource') ||
          errorString.includes('quota') ||
          errorString.includes('limit') ||
          errorString.includes('exceed') ||
          errorString.includes('exhausted') ||
          errorString.includes('resource') ||
          errorString.includes('429 resource has been exhausted')) {
        console.log('Quota error detected!');
        const quotaError = 'API quota exceeded. Please try again later or select activities manually.';
        setLocalError(quotaError);
        if (setError) setError(quotaError);
      } else {
        const errorMessage = err.response?.data?.error || 'Failed to get activity recommendations.';
        setLocalError(errorMessage);
        if (setError) setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {localError && (
        isQuotaError(localError) ? (
          <QuotaErrorAlert>
            <div className="error-header">
              <ErrorOutlineIcon className="error-icon" />
              <Typography variant="h5" className="error-title">
                API Quota Exceeded
              </Typography>
            </div>
            <Typography className="error-message">
              {localError}
            </Typography>
            <div className="error-actions">
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={recommendActivities}
              >
                Try Again
              </Button>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                You can still manually select activities below.
              </Typography>
            </div>
          </QuotaErrorAlert>
        ) : (
          <Alert severity="error" sx={{ mb: 2 }}>
            {localError}
          </Alert>
        )
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
            {resumeType === 'specific' 
              ? `Recommended Activities for ${jobTitle} (${selectedActivities.length} selected)`
              : `Select Relevant Activities (${selectedActivities.length} selected)`}
          </Typography>
          
          <Grid container spacing={2}>
            {activities.map((activity) => {
              // Check if this activity is selected by comparing objects or titles
              const isSelected = selectedActivities.some(selectedActivity => 
                typeof selectedActivity === 'object' 
                  ? selectedActivity.title === activity.title 
                  : selectedActivity === activity.title
              );
              
              return (
                <Grid item xs={12} sm={6} md={4} key={activity.activity_id || activity.title}>
                  <ActivityCard 
                    selected={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        // Remove from selected
                        setSelectedActivities(prev => 
                          prev.filter(a => 
                            typeof a === 'object' 
                              ? a.title !== activity.title 
                              : a !== activity.title
                          )
                        );
                      } else {
                        // Add to selected
                        setSelectedActivities(prev => [...prev, activity]);
                      }
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle1" noWrap>
                        {activity.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {activity.description}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        mt: 2
                      }}>
                        <ActivityChip 
                          label="Select"
                          sx={{
                            backgroundColor: isSelected 
                              ? 'rgba(33, 150, 243, 0.1)' 
                              : 'rgba(0, 0, 0, 0.05)',
                            color: isSelected
                              ? 'primary.dark'
                              : 'text.secondary'
                          }}
                        />
                      </Box>
                    </Box>
                  </ActivityCard>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default SelectActivities; 