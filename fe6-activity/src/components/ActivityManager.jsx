// src/components/ActivityManager.jsx
import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Button, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RegularActivityList from './RegularActivityList';
import DailyActivityList from './DailyActivityList';
import AddActivity from './AddActivity';
import axios from 'axios';
const base_url = import.meta.env.VITE_API_BASE_URL;

const ActivityManager = () => {
  const [regularActivities, setRegularActivities] = useState([]);
  const [dailyActivities, setDailyActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDailyActivities, setLoadingDailyActivities] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    status: 'ongoing',
    leetcode_rating: 0,
    skills: []
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch activities on component mount
  useEffect(() => {
    if (activeTab === 0) {
      fetchRegularActivities();
    } else {
      fetchDailyActivities();
    }
  }, [activeTab]);

  const fetchRegularActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${base_url}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegularActivities(response.data);
      console.log('Regular activities:', response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching regular activities:', err);
      setError('Failed to load regular activities');
      setLoading(false);
    }
  };

  const fetchDailyActivities = async () => {
    setLoadingDailyActivities(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${base_url}/api/daily_activities`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Log the raw response to see the structure
      console.log('Daily activities raw response:', response.data);
      
      // Ensure each activity has a consistent ID property
      setDailyActivities(response.data);
    } catch (error) {
      console.error("Error fetching daily activities:", error);
      setError('Failed to fetch daily activities');
    } finally {
      setLoadingDailyActivities(false);
    }
  };

  const handleAddActivity = (type, newActivity) => {
    if (type === 'regular') {
      setRegularActivities(prev => [newActivity, ...prev]);
    } else if (type === 'daily') {
      setDailyActivities(prev => [newActivity, ...prev]);
    }
    setSnackbarMessage(`${type === 'regular' ? 'Activity' : 'Daily activity'} added successfully!`);
    setSnackbarOpen(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity({
      ...activity,
      isDaily: false // Flag to identify this as a regular activity
    });
    setEditFormData({
      title: activity.title,
      description: activity.description,
      status: activity.status || 'ongoing',
      leetcode_rating: activity.leetcode_rating || 0,
      skills: activity.skills || []
    });
  };

  const handleEditDailyActivity = (activity) => {
    setEditingActivity({
      ...activity,
      isDaily: true // Flag to identify this as a daily activity
    });
    setEditFormData({
      title: activity.title,
      description: activity.description
    });
  };

  const handleDeleteActivity = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${base_url}/api/activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegularActivities(prev => prev.filter(a => a.activity_id !== id));
      setSnackbarMessage('Activity deleted successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Failed to delete activity');
    }
  };

  const handleDeleteDailyActivity = async (id) => {
    try {
      console.log('Deleting daily activity with ID:', id);
      
      
      
      const token = localStorage.getItem('token');
      await axios.delete(`${base_url}/api/daily_activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDailyActivities(prev => prev.filter(a => a.daily_activity_id !== id));
        // Try all possible ID properties
        
    
      
      setSnackbarMessage('Daily activity deleted successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting daily activity:', err);
      setError('Failed to delete daily activity');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Major Activities" />
          <Tab label="Daily Activities" />
        </Tabs>
        
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {activeTab === 0 ? (
        loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>Loading activities...</Box>
        ) : (
          <RegularActivityList
            activities={regularActivities}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivity}
          />
        )
      ) : (
        loadingDailyActivities ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>Loading daily activities...</Box>
        ) : (
          <DailyActivityList
            daily_activities_prop={dailyActivities}
            onEdit={handleEditDailyActivity}
            onDelete={handleDeleteDailyActivity}
          />
        )
      )}

      <AddActivity 
        open={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        onActivityAdded={handleAddActivity}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {editingActivity && (
        <Dialog
          open={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Edit {editingActivity.isDaily ? 'Daily Activity' : 'Activity'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={editFormData.title}
              onChange={(e) => setEditFormData(prev => ({
                ...prev,
                title: e.target.value
              }))}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editFormData.description}
              onChange={(e) => setEditFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
            />
            
            {/* Only show status field for regular activities */}
            {!editingActivity.isDaily && (
              <TextField
                select
                margin="dense"
                label="Status"
                fullWidth
                value={editFormData.status}
                onChange={(e) => setEditFormData(prev => ({
                  ...prev,
                  status: e.target.value
                }))}
              >
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingActivity(null)}>Cancel</Button>
            <Button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  
                  if (editingActivity.isDaily) {
                    // Handle daily activity update
                    const response = await axios.put(
                      `${base_url}/api/daily_activities/${editingActivity.daily_activity_id}`,
                      {
                        title: editFormData.title,
                        description: editFormData.description
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    setDailyActivities(prev => 
                      prev.map(activity => 
                        activity.daily_activity_id === editingActivity.daily_activity_id 
                          ? { 
                              ...activity, 
                              title: editFormData.title,
                              description: editFormData.description
                            }
                          : activity
                      )
                    );
                  } else {
                    // Handle regular activity update
                    const response = await axios.put(
                      `${base_url}/api/activities/${editingActivity.activity_id}`,
                      editFormData,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    setRegularActivities(prev => 
                      prev.map(activity => 
                        activity.activity_id === editingActivity.activity_id 
                          ? { ...activity, ...editFormData }
                          : activity
                      )
                    );
                  }
                  
                  setEditingActivity(null);
                  setSnackbarMessage(`${editingActivity.isDaily ? 'Daily activity' : 'Activity'} updated successfully!`);
                  setSnackbarOpen(true);
                } catch (error) {
                  console.error('Error updating activity:', error);
                  setError(`Failed to update ${editingActivity.isDaily ? 'daily activity' : 'activity'}`);
                }
              }}
              variant="contained"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default ActivityManager;