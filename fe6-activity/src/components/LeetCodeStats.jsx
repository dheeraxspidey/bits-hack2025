import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Grid,
  Snackbar
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LEETCODE_CACHE_KEY = 'leetcode_data_cache';
const LEETCODE_CACHE_EXPIRY = 24 * 60 * 60 * 1000;

const CustomTooltip = ({ active, payload, label }) => {
  // ... existing CustomTooltip component code ...
};

const LeetCodeStats = ({ username }) => {
  const [leetcodeStatus, setLeetcodeStatus] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [isSetUsernameModalOpen, setIsSetUsernameModalOpen] = useState(false);
  const [newLeetcodeUsername, setNewLeetcodeUsername] = useState('');
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (username) {
      checkLeetCodeStatus();
    }
  }, [username]);

  const getLeetCodeFromCache = () => {
    const cachedData = localStorage.getItem(LEETCODE_CACHE_KEY);
    if (!cachedData) return null;

    try {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
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
    if (!username) return;

    try {
      const cachedData = getLeetCodeFromCache();
      if (cachedData) {
        setLeetcodeStatus(cachedData.status);
        setLeetcodeData(cachedData.data);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${base_url}/api/user/leetcode_status/${username}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      
      setLeetcodeStatus(response.data);
      if (response.data.has_leetcode) {
        const data = await fetchLeetcodeData();
        saveLeetCodeToCache({ status: response.data, data });
      }
    } catch (error) {
      handleLeetCodeError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeetcodeData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${base_url}/api/user/${username}/leetcode_history`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      setLeetcodeData(response.data);
      return response.data;
    } catch (error) {
      handleLeetCodeError(error);
    }
  };

  const handleLeetCodeError = (error) => {
    if (error.code === 'ERR_NETWORK') {
      setError('Network error. Please check your connection.');
    } else if (error.response?.status === 400) {
      setError('LeetCode connection required');
    } else {
      setError(error.response?.data?.error || 'LeetCode operation failed');
    }
  };

  const handleSaveLeetcodeUsername = async () => {
    if (!newLeetcodeUsername.trim()) {
      setError('Please enter a valid LeetCode username');
      return;
    }

    setIsSettingUsername(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${base_url}/api/user/${username}/set_leetcode_username`,
        { leetcode_username: newLeetcodeUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSetUsernameModalOpen(false);
      await checkLeetCodeStatus();
      setSnackbarMessage('LeetCode username updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      handleLeetCodeError(error);
    } finally {
      setIsSettingUsername(false);
    }
  };

  const handleUpdateLeetCodeData = async () => {
    setLoading(true);
    try {
      localStorage.removeItem(LEETCODE_CACHE_KEY);
      await checkLeetCodeStatus();
      setSnackbarMessage('LeetCode data refreshed successfully');
      setSnackbarOpen(true);
    } catch (error) {
      handleLeetCodeError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetLeetcodeUsername = () => {
    setIsSetUsernameModalOpen(true);
  };

  const handleCloseSetUsernameModal = () => {
    setIsSetUsernameModalOpen(false);
    setNewLeetcodeUsername('');
    setError('');
  };

  return (<div className="leetcode-section">
      <div className="leetcode-header">
        <div className="leetcode-title">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">LeetCode Stats</Typography>
              <IconButton
                size="small"
                onClick={handleSetLeetcodeUsername}
                sx={{
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <EditIcon sx={{ fontSize: '16px', color: 'text.secondary' }} />
              </IconButton>
            </Box>
            {leetcodeStatus?.has_leetcode && (
              <IconButton
                size="small"
                onClick={handleUpdateLeetCodeData}
                sx={{
                  padding: '8px',
                  color: '#ffa116',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 161, 22, 0.04)'
                  }
                }}
              >
                <RefreshIcon sx={{ fontSize: '20px' }} />
              </IconButton>
            )}
          </Box>
        </div>
      </div>
      
      <div className="leetcode-content">
        {error ? (
          <Typography color="error" gutterBottom>
            {error}
            <Button 
              onClick={() => {
                setError(null);
                checkLeetCodeStatus();
              }}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Typography>
        ) : loading ? (
          <CircularProgress />
        ) : !leetcodeStatus?.has_leetcode ? (
          <div className="leetcode-setup">
            <Typography variant="body1" gutterBottom>
              You haven't connected your LeetCode account yet. Connect it to track your progress.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSetLeetcodeUsername}
              startIcon={<CodeIcon />}
            >
              Set LeetCode Username
            </Button>
          </div>
        ) : (
          <Grid container spacing={3}>
            {/* Problem Solving Stats Card */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 3 
                }}>
                  <Box sx={{ 
                    width: { xs: '160px', sm: '200px' },
                    height: { xs: '160px', sm: '200px' },
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        border: '20px solid #f3f3f3',
                        borderRadius: '50%'
                      }
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        border: '20px solid',
                        borderColor: (theme) => `${theme.palette.primary.main} transparent transparent transparent`,
                        borderRadius: '50%',
                        transform: 'rotate(-45deg)',
                        animation: 'rotate 1s linear'
                      }} />
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        zIndex: 1,
                        fontSize: { 
                          xs: '1.2rem',  // Smaller font size on mobile
                          sm: '2rem'     // Regular size on larger screens
                        }
                      }}>
                        {leetcodeData?.submission_stats?.total || '258'}/3466
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        position: 'absolute',
                        bottom: '25%',
                        zIndex: 1,
                        fontSize: {
                          xs: '0.75rem',  // Smaller font size on mobile
                          sm: '0.875rem'  // Regular size on larger screens
                        }
                      }}>
                        Solved
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, width: '100%' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <span>Easy</span>
                        <span style={{ color: '#00b8a3' }}>{leetcodeData?.submission_stats?.easy || '118'}/861</span>
                      </Typography>
                      <Box sx={{ 
                        width: '100%',
                        height: '8px',
                        bgcolor: '#f3f3f3',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: '40%',
                          height: '100%',
                          bgcolor: '#00b8a3',
                          borderRadius: '4px'
                        }} />
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <span>Med</span>
                        <span style={{ color: '#ffc01e' }}>{leetcodeData?.submission_stats?.medium || '128'}/1801</span>
                      </Typography>
                      <Box sx={{ 
                        width: '100%',
                        height: '8px',
                        bgcolor: '#f3f3f3',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: '35%',
                          height: '100%',
                          bgcolor: '#ffc01e',
                          borderRadius: '4px'
                        }} />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <span>Hard</span>
                        <span style={{ color: '#ff375f' }}>{leetcodeData?.submission_stats?.hard || '12'}/804</span>
                      </Typography>
                      <Box sx={{ 
                        width: '100%',
                        height: '8px',
                        bgcolor: '#f3f3f3',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: '15%',
                          height: '100%',
                          bgcolor: '#ff375f',
                          borderRadius: '4px'
                        }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Contest Rating Graph Card */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  gap: { xs: 1, sm: 2 },
                  mb: 2 
                }}>
                  <Box sx={{ 
                    display: { xs: 'grid', sm: 'block' },
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    width: '100%'
                  }}>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="body2" color="text.secondary">Contest Rating</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2cbe4e' }}>
                        {leetcodeData?.contest_history?.[leetcodeData.contest_history.length - 1]?.rating || '1,651'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="body2" color="text.secondary">Attended</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {leetcodeData?.contest_history?.length || '43'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="body2" color="text.secondary">Top %</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        17.02%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ 
                  flex: 1, 
                  minHeight: { xs: 250, sm: 200 },
                  mt: { xs: 2, sm: 0 }
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={leetcodeData?.contest_history?.map(contest => ({
                        ...contest,
                        date: new Date(contest.date * 1000).getTime()
                      })) || []}
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        type="number"
                        scale="time"
                        domain={['auto', 'auto']}
                        tickFormatter={(timestamp) => {
                          const date = new Date(timestamp);
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric'
                          });
                        }}
                        stroke="#999"
                      />
                      <YAxis stroke="#999" />
                      <Tooltip content={CustomTooltip} />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#ffa116"
                        strokeWidth={2}
                        dot={{ r: 0 }}
                        activeDot={{ r: 6, fill: '#ffa116' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </div>

      {/* Set Username Modal */}
      <Dialog 
        open={isSetUsernameModalOpen} 
        onClose={() => {
          setIsSetUsernameModalOpen(false);
          setNewLeetcodeUsername('');
          setError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {leetcodeStatus?.has_leetcode ? 'Update LeetCode Username' : 'Set LeetCode Username'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {leetcodeStatus?.has_leetcode 
              ? 'Enter your new LeetCode username to update your connection.'
              : 'Enter your LeetCode username to start tracking your progress.'}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="LeetCode Username"
            type="text"
            fullWidth
            value={newLeetcodeUsername}
            onChange={(e) => setNewLeetcodeUsername(e.target.value)}
            error={!!error}
            helperText={error}
            disabled={isSettingUsername}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setIsSetUsernameModalOpen(false);
              setNewLeetcodeUsername('');
              setError('');
            }} 
            disabled={isSettingUsername}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveLeetcodeUsername} 
            variant="contained"
            disabled={isSettingUsername || !newLeetcodeUsername.trim()}
          >
            {isSettingUsername ? (
              <CircularProgress size={24} />
            ) : leetcodeStatus?.has_leetcode ? (
              'Update Username'
            ) : (
              'Set Username'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeetCodeStats; 