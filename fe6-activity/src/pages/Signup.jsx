import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileDetails from '../components/ProfileDetails';
const base_url = import.meta.env.VITE_API_BASE_URL;
const steps = ['Account Details', 'Profile Information'];

const Signup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.post(`${base_url}/api/auth/signup`, {
          username: formData.email.split('@')[0],
          email: formData.email,
          password: formData.password,
          name: formData.name
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setActiveStep(1);
        }
      } catch (err) {
        console.error('Signup error:', err);
        setError(err.response?.data?.error || 'An error occurred during signup');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProfileSubmit = async (profileData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${base_url}/api/user/profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.error || 'An error occurred while saving profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        backgroundColor: 'background.default'
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {activeStep === 0 ? (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleNext(); }} sx={{ width: '100%' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Create Account
              </Typography>

              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              
              <TextField
                label="Password"
                fullWidth
                margin="normal"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              
              <TextField
                label="Confirm Password"
                fullWidth
                margin="normal"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Next'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link href="/login" variant="body2">
                  Already have an account? Sign In
                </Link>
              </Box>
            </Box>
          ) : (
            <ProfileDetails
              onSubmit={handleProfileSubmit}
              onSkip={handleSkip}
              loading={loading}
            />
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup; 