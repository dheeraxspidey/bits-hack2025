import { useState } from 'react';

import { 
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const CoverLetterGenerator = ({ user }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = user?.token || localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/cover_letter/generate`, {
        job_description: jobDescription,
        tone: tone
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setCoverLetter(response.data.cover_letter);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover_letter_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: 800, 
      margin: '0 auto',
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Cover Letter Generator
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Paste Job Description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          required
          sx={{ mb: 3 }}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Tone Style</InputLabel>
          <Select
            value={tone}
            label="Tone Style"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="enthusiastic">Enthusiastic</MenuItem>
            <MenuItem value="formal">Formal</MenuItem>
          </Select>
        </FormControl>

        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          disabled={loading || !jobDescription}
          fullWidth
          sx={{ py: 1.5, mb: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Cover Letter'}
        </Button>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </form>

      {coverLetter && (
        <Paper elevation={3} sx={{ p: 3, position: 'relative' }}>
          <Button
            variant="outlined"
            onClick={handleDownload}
            sx={{ position: 'absolute', right: 16, top: 16 }}
          >
            Download
          </Button>
          <Typography variant="h6" gutterBottom>
            Your Custom Cover Letter
          </Typography>
          <Box component="pre" sx={{ 
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            lineHeight: 1.6
          }}>
            {coverLetter}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CoverLetterGenerator; 