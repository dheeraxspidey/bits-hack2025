import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Grid,
  Card,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  MenuItem,
  Tabs,
  Tab,
  Snackbar,
  useTheme,
  Fab,
  Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import AddActivity from '../components/AddActivity';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import GitHubIcon from '@mui/icons-material/GitHub';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ResponsiveCalendar } from '@nivo/calendar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactTypingEffect from 'react-typing-effect';
import LeetCodeStats from '../components/LeetCodeStats';
import ActivityList from '../components/ActivityList';
import ActivityManager from '../components/ActivityManager';
import './Dashboard.css';

const base_url = import.meta.env.VITE_API_BASE_URL;

const LEETCODE_CACHE_KEY = 'leetcode_data_cache';
const LEETCODE_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Custom tooltip for the line chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ 
        p: 2, 
        backgroundColor: 'background.paper',
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle2" color="primary">
          {data.contest_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(label).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Typography>
        <Typography variant="body2">
          Rating: <strong>{data.rating}</strong>
        </Typography>
        <Typography variant="body2">
          Rank: <strong>#{data.ranking}</strong>
        </Typography>
      </Paper>
    );
  }
  return null;
};

const Dashboard = () => {
  const theme = useTheme();
  const [userData, setUserData] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return JSON.parse(storedUser) || {};
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  });
  const username = userData?.username;
  const [leetcodeStatus, setLeetcodeStatus] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [isSetUsernameModalOpen, setIsSetUsernameModalOpen] = useState(false);
  const [newLeetcodeUsername, setNewLeetcodeUsername] = useState('');
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCertifications: 0,
    githubContributions: 0,
    leetcodeSolved: 0
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Validate username
      if (!username) {
        console.error('No username found in user data');
        setError('User data is incomplete. Please try logging in again.');
        return;
      }

      console.log('Fetching data for username:', username);
      await fetchActivities();
      await checkLeetCodeStatus();
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${base_url}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Calculate stats from activities
      const projectCount = response.data.filter(activity => 
        activity.activity_type?.toLowerCase() === 'project'
      ).length;
      
      const certificationCount = response.data.filter(activity => 
        activity.activity_type?.toLowerCase() === 'certification'
      ).length;
      
      setStats(prevStats => ({
        ...prevStats,
        totalProjects: projectCount,
        totalCertifications: certificationCount
      }));
    } catch (error) {
      console.error("Error fetching activities for stats:", error);
      setError('Failed to fetch activities');
    }
  };

  const getLeetCodeFromCache = () => {
    const cachedData = localStorage.getItem(LEETCODE_CACHE_KEY);
    if (!cachedData) return null;

    try {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
      
      // Check if cache has expired (24 hours)
      if (now - timestamp > LEETCODE_CACHE_EXPIRY) {
        localStorage.removeItem(LEETCODE_CACHE_KEY);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error parsing cached LeetCode data:', error);
      localStorage.removeItem(LEETCODE_CACHE_KEY);
      return null;
    }
  };

  const saveLeetCodeToCache = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(LEETCODE_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching LeetCode data:', error);
    }
  };

  const checkLeetCodeStatus = async () => {
    if (!username) {
      console.error('Cannot check LeetCode status: No username provided');
      return;
    }
    
    try {
      // First check cache
      const cachedData = getLeetCodeFromCache();
      if (cachedData) {
        console.log('Using cached LeetCode data');
        setLeetcodeStatus(cachedData.status);
        setLeetcodeData(cachedData.data);
        return;
      }

      const token = localStorage.getItem('token');
      console.log('Checking LeetCode status for user:', username);
      const response = await axios.get(
        `${base_url}/api/user/leetcode_status/${username}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      
      console.log('LeetCode status response:', response.data);
      setLeetcodeStatus(response.data);
      
      if (response.data.has_leetcode) {
        const leetcodeData = await fetchLeetcodeData();
        // Cache both status and data
        saveLeetCodeToCache({
          status: response.data,
          data: leetcodeData
        });
      } else {
        console.log('User does not have LeetCode username set');
      }
    } catch (error) {
      console.error('Error checking LeetCode status:', error.response?.data || error.message);
      if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.response?.data?.error || 'Error checking LeetCode status');
        setLeetcodeStatus({ has_leetcode: false });
      }
    }
  };

  const fetchLeetcodeData = async () => {
    if (!username) {
      console.error('Cannot fetch LeetCode data: No username provided');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Fetching LeetCode data for user:', username);
      const response = await axios.get(
        `${base_url}/api/user/${username}/leetcode_history`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      console.log('LeetCode data response:', response.data);
      setLeetcodeData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching LeetCode data:', error.response?.data || error.message);
      handleLeetCodeError(error);
      return null;
    }
  };

  const handleLeetCodeError = (error) => {
    if (error.code === 'ERR_NETWORK') {
      setError('Network error. Please check your connection.');
    } else if (error.response?.status === 400 && error.response?.data?.needs_setup) {
      setLeetcodeStatus(prev => ({ ...prev, has_leetcode: false }));
    } else {
      setError(error.response?.data?.error || 'Error fetching LeetCode data');
    }
  };

  const handleSetLeetcodeUsername = async () => {
    setIsSetUsernameModalOpen(true);
  };

  const handleCloseSetUsernameModal = () => {
    setIsSetUsernameModalOpen(false);
    setNewLeetcodeUsername('');
    setError('');
  };

  const handleSaveLeetcodeUsername = async () => {
    if (!username || !newLeetcodeUsername.trim()) {
      setError('Please enter a valid LeetCode username');
      return;
    }

    setIsSettingUsername(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${base_url}/api/user/${username}/set_leetcode_username`,
        { leetcode_username: newLeetcodeUsername },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      handleCloseSetUsernameModal();
      await checkLeetCodeStatus();
    } catch (error) {
      console.error('Error setting LeetCode username:', error);
      if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.response?.data?.error || 'Error setting LeetCode username');
      }
    } finally {
      setIsSettingUsername(false);
    }
  };

  const handleUpdateLeetCodeData = async () => {
    if (!username) return;

    setLoading(true);
    setError(null);
    try {
      // Force refresh by removing cache
      localStorage.removeItem(LEETCODE_CACHE_KEY);
      await checkLeetCodeStatus();
      setSnackbarMessage('LeetCode data updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating LeetCode data:', error);
      setError('Error updating LeetCode data');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLeetCodeStats = () => {
    navigate(`/user/${username}/leetcode`);
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchUserData();
      await fetchActivities();
    };
    
    initializeData();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 600, 
          color: 'text.primary',
          mb: 1
        }}>
          Dashboard
        </Typography>
      </div>
      
      <div className="dashboard-container">
        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon projects">
              <WorkIcon />
            </div>
            <div className="stat-info">
              <h2>{stats.totalProjects}</h2>
              <p>Projects</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon certs">
              <SchoolIcon />
            </div>
            <div className="stat-info">
              <h2>{stats.totalCertifications}</h2>
              <p>Certifications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon github">
              <GitHubIcon />
            </div>
            <div className="stat-info">
              <h2>{stats.githubContributions}</h2>
              <p>GitHub Contributions</p>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            background: 'linear-gradient(135deg, #006989 0%, #4B89AC 100%)',
            borderRadius: 2,
            color: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
              pointerEvents: 'none'
            }
          }}
        >
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Welcome, {userData?.name || 'Developer'}! 👋
          </Typography>
          <Box sx={{ height: '60px', display: 'flex', alignItems: 'center' }}>
            <ReactTypingEffect
              text={[
                "Track your achievements and build the perfect resume",
                "Showcase your LeetCode progress and skills",
                "Document your journey to success"
              ]}
              speed={50}
              eraseSpeed={50}
              typingDelay={1000}
              eraseDelay={2000}
              cursorRenderer={cursor => (
                <span style={{ color: '#ffa116' }}>{cursor}</span>
              )}
              displayTextRenderer={(text) => (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1.1rem'
                  }}
                >
                  {text}
                </Typography>
              )}
            />
          </Box>
        </Box>
        
        <LeetCodeStats username={username} />

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card" onClick={() => navigate('/resume-builder')}>
            <h3>Resume Builder</h3>
            <p>Create a professional resume using your profile and activities</p>
            <button>Create Resume</button>
          </div>
          <div className="action-card" onClick={() => setIsAddActivityOpen(true)}>
            <h3>Track Progress</h3>
            <p>Log your achievements, projects, and learning progress</p>
            <button>Log New Activity</button>
          </div>
        </div>

        {/* Activities Tabs Section */}
        <div className="activities-section">
          <ActivityManager />
        </div>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}
      </div>

      {/* Floating Action Button for Adding Activity */}
      <Zoom in={true} timeout={500} unmountOnExit>
        <Fab 
          color="primary" 
          aria-label="add activity"
          onClick={() => setIsAddActivityOpen(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 32, 
            right: 32,
            width: 64,
            height: 64,
            borderRadius: '16px',
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            }
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Zoom>

      {/* Add Activity Dialog */}
      <AddActivity 
        open={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        onActivityAdded={(type, newActivity) => {
          setIsAddActivityOpen(false);
          setSnackbarMessage('Activity added successfully!');
          setSnackbarOpen(true);
        }}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

export default Dashboard; 