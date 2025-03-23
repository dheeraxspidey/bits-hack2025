import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField
} from '@mui/material';

const SelectResumeType = ({ 
  resumeType, 
  setResumeType, 
  jobTitle, 
  setJobTitle,
  jobDescription,
  setJobDescription,
  predefinedJobTitles 
}) => {
  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 400 }, mx: 'auto', width: '100%' }}>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Resume Type</InputLabel>
        <Select
          value={resumeType}
          onChange={(e) => setResumeType(e.target.value)}
          label="Resume Type"
        >
          <MenuItem value="general">General Resume</MenuItem>
          <MenuItem value="specific">Job Specific</MenuItem>
        </Select>
      </FormControl>
      
      {resumeType === 'specific' && (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Job Title</InputLabel>
            <Select
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              label="Job Title"
            >
              {predefinedJobTitles.map((title) => (
                <MenuItem key={title} value={title}>
                  {title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select a job title for your targeted resume</FormHelperText>
          </FormControl>

          <TextField
            fullWidth
            label="Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            multiline
            minRows={3}
            sx={{ mb: 3 }}
            helperText="Paste the job description you're targeting (used for resume customization)"
          />
        </>
      )}
    </Box>
  );
};

export default SelectResumeType; 