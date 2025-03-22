import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Link,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close, ArrowBack, ArrowForward } from '@mui/icons-material';
import axios from 'axios';

const base_url = import.meta.env.VITE_API_BASE_URL;

const steps = ['Get API Key', 'Enter API Key'];

const SetAPIKey = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid API key',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${base_url}/api/user/gemini_api_key`,
        { api_key: apiKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({
        open: true,
        message: 'API key saved successfully!',
        severity: 'success'
      });
      onClose();
      setActiveStep(0);
      setApiKey('');
    } catch (error) {
      console.error('Error saving API key:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save API key',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              How to get your Gemini API key:
            </Typography>
            <ol>
              <li>
                Go to the{' '}
                <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">
                  Google AI Studio
                </Link>
              </li>
              <li>Sign in with your Google account</li>
              <li>Create a new project or select an existing one</li>
              <li>Click "Create API key" in the API keys section</li>
              <li>Copy the generated API key</li>
            </ol>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                I have my API key
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Gemini API Key"
              type="password"
              fullWidth
              variant="outlined"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              helperText="We'll store your key securely in our database"
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Set Gemini API Key</span>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
          <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>
        
        <DialogContent>
          {getStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Button
            onClick={activeStep === 0 ? onClose : handleBack}
            startIcon={<ArrowBack />}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={loading}
              endIcon={!loading && <ArrowForward />}
            >
              {loading ? 'Saving...' : 'Save API Key'}
            </Button>
          ) : (
            <div /> // Spacer for alignment
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SetAPIKey; 