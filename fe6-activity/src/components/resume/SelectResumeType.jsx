import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';

const SelectResumeType = ({ 
  resumeType, 
  setResumeType, 
  jobTitle, 
  setJobTitle, 
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
      )}
    </Box>
  );
};

export default SelectResumeType; 