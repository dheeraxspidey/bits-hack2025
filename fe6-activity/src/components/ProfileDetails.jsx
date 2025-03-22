import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Stack,
  Avatar,
  FormControlLabel,
  Checkbox,
  FormHelperText
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const ProfileDetails = ({ onSubmit, onSkip, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    education: initialData.education || [],
    experience: initialData.experience || [],
    skills: initialData.skills || [],
    bio: initialData.bio || '',
    location: initialData.location || '',
    github: initialData.github || '',
    linkedin: initialData.linkedin || '',
  });

  const [newEducation, setNewEducation] = useState({
    school: '',
    degree: '',
    field: '',
    start_year: '',
    end_year: '',
    current: false
  });

  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
    current: false
  });

  // Add validation state
  const [errors, setErrors] = useState({});
  const [educationErrors, setEducationErrors] = useState({});
  const [experienceErrors, setExperienceErrors] = useState({});

  const [newSkill, setNewSkill] = useState('');
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState(-1);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState(-1);

  useEffect(() => {
    setFormData({
      name: initialData.name || '',
      education: initialData.education || [],
      experience: initialData.experience || [],
      skills: initialData.skills || [],
      bio: initialData.bio || '',
      location: initialData.location || '',
      github: initialData.github || '',
      linkedin: initialData.linkedin || '',
    });
  }, [initialData]);

  // URL validation function
  const isValidUrl = (url) => {
    if (!url) return true; // Empty URLs are allowed
    try {
      // Check if it's a valid URL format
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Year validation function
  const isValidYear = (year) => {
    if (!year) return true; // Empty years are allowed
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 10;
  };

  // Date validation function
  const isValidDate = (dateString) => {
    if (!dateString) return true; // Empty dates are allowed
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Compare dates function
  const isStartBeforeEnd = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Validate URLs as user types
    if (name === 'github' || name === 'linkedin') {
      if (value && !isValidUrl(value)) {
        setErrors(prev => ({
          ...prev,
          [name]: `Please enter a valid URL (include https://)`
        }));
      }
    }
  };

  const handleOpenEducationDialog = (index = -1) => {
    setEditingEducationIndex(index);
    setEducationErrors({});
    if (index >= 0) {
      setNewEducation(formData.education[index]);
    } else {
      setNewEducation({
        school: '',
        degree: '',
        field: '',
        start_year: '',
        end_year: '',
        current: false
      });
    }
    setIsEducationDialogOpen(true);
  };

  const handleOpenExperienceDialog = (index = -1) => {
    setEditingExperienceIndex(index);
    setExperienceErrors({});
    if (index >= 0) {
      setNewExperience(formData.experience[index]);
    } else {
      setNewExperience({
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        description: '',
        current: false
      });
    }
    setIsExperienceDialogOpen(true);
  };

  const validateEducation = () => {
    const newErrors = {};
    
    if (!newEducation.school.trim()) {
      newErrors.school = 'School name is required';
    }
    
    if (!newEducation.start_year.trim()) {
      newErrors.start_year = 'Start year is required';
    } else if (!isValidYear(newEducation.start_year)) {
      newErrors.start_year = 'Please enter a valid year (1900-present)';
    }
    
    if (!newEducation.current && !newEducation.end_year.trim()) {
      newErrors.end_year = 'End year is required';
    } else if (!newEducation.current && !isValidYear(newEducation.end_year)) {
      newErrors.end_year = 'Please enter a valid year (1900-present)';
    }
    
    // Check if start year is before end year
    if (newEducation.start_year && newEducation.end_year && 
        parseInt(newEducation.start_year) > parseInt(newEducation.end_year)) {
      newErrors.end_year = 'End year must be after start year';
    }
    
    setEducationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateExperience = () => {
    const newErrors = {};
    
    if (!newExperience.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!newExperience.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    if (!newExperience.start_date) {
      newErrors.start_date = 'Start date is required';
    } else if (!isValidDate(newExperience.start_date)) {
      newErrors.start_date = 'Please enter a valid date';
    }
    
    if (!newExperience.current && !newExperience.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (!newExperience.current && !isValidDate(newExperience.end_date)) {
      newErrors.end_date = 'Please enter a valid date';
    }
    
    // Check if start date is before end date
    if (newExperience.start_date && newExperience.end_date && 
        !isStartBeforeEnd(newExperience.start_date, newExperience.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setExperienceErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEducation = () => {
    if (!validateEducation()) {
      return;
    }
    
    setFormData(prev => {
      const newEducationList = [...prev.education];
      if (editingEducationIndex >= 0) {
        newEducationList[editingEducationIndex] = newEducation;
      } else {
        newEducationList.push(newEducation);
      }
      return { ...prev, education: newEducationList };
    });
    setEditingEducationIndex(-1);
    setIsEducationDialogOpen(false);
  };

  const handleAddExperience = () => {
    if (!validateExperience()) {
      return;
    }
    
    setFormData(prev => {
      const newExperienceList = [...prev.experience];
      if (editingExperienceIndex >= 0) {
        newExperienceList[editingExperienceIndex] = newExperience;
      } else {
        newExperienceList.push(newExperience);
      }
      return { ...prev, experience: newExperienceList };
    });
    setEditingExperienceIndex(-1);
    setIsExperienceDialogOpen(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.github && !isValidUrl(formData.github)) {
      newErrors.github = 'Please enter a valid URL (include https://)';
    }
    
    if (formData.linkedin && !isValidUrl(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid URL (include https://)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Format education data
    const formattedEducation = formData.education.map(edu => ({
      school: edu.school || '',
      degree: edu.degree || '',
      field: edu.field || '',
      start_year: edu.start_year || '',
      end_year: edu.end_year || '',
      current: edu.current || false,
      description: edu.description || ''
    }));

    // Format experience data
    const formattedExperience = formData.experience.map(exp => ({
      company: exp.company || '',
      position: exp.position || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      current: exp.current || false,
      description: exp.description || ''
    }));

    // Create the final formatted data
    const finalData = {
      ...formData,
      education: formattedEducation,
      experience: formattedExperience,
      skills: formData.skills || [],
      bio: formData.bio || '',
      location: formData.location || '',
      github: formData.github || '',
      linkedin: formData.linkedin || '',
    };

    onSubmit(finalData);
  };

  // Handle education field change with validation
  const handleEducationChange = (field, value) => {
    setNewEducation(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is edited
    if (educationErrors[field]) {
      setEducationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Validate years as user types
    if (field === 'start_year' || field === 'end_year') {
      if (value && !isValidYear(value)) {
        setEducationErrors(prev => ({
          ...prev,
          [field]: 'Please enter a valid year (1900-present)'
        }));
      }
      
      // Check start/end year relationship
      if (field === 'end_year' && newEducation.start_year && value &&
          parseInt(newEducation.start_year) > parseInt(value)) {
        setEducationErrors(prev => ({
          ...prev,
          end_year: 'End year must be after start year'
        }));
      } else if (field === 'start_year' && newEducation.end_year && value &&
                parseInt(value) > parseInt(newEducation.end_year)) {
        setEducationErrors(prev => ({
          ...prev,
          start_year: 'Start year must be before end year'
        }));
      }
    }
  };

  // Handle experience field change with validation
  const handleExperienceChange = (field, value) => {
    setNewExperience(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is edited
    if (experienceErrors[field]) {
      setExperienceErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Validate dates as user types
    if (field === 'start_date' || field === 'end_date') {
      if (value && !isValidDate(value)) {
        setExperienceErrors(prev => ({
          ...prev,
          [field]: 'Please enter a valid date'
        }));
      }
      
      // Check start/end date relationship
      if (field === 'end_date' && newExperience.start_date && value &&
          !isStartBeforeEnd(newExperience.start_date, value)) {
        setExperienceErrors(prev => ({
          ...prev,
          end_date: 'End date must be after start date'
        }));
      } else if (field === 'start_date' && newExperience.end_date && value &&
                !isStartBeforeEnd(value, newExperience.end_date)) {
        setExperienceErrors(prev => ({
          ...prev,
          start_date: 'Start date must be before end date'
        }));
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Profile Details (Optional)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Bio"
            name="bio"
            multiline
            rows={4}
            value={formData.bio}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="GitHub Profile"
            name="github"
            value={formData.github}
            onChange={handleChange}
            error={!!errors.github}
            helperText={errors.github || "e.g., https://github.com/username"}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="LinkedIn Profile"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            error={!!errors.linkedin}
            helperText={errors.linkedin || "e.g., https://linkedin.com/in/username"}
          />
        </Grid>

        {/* Education Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Education
            </Typography>
            {formData.education.map((edu, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveEducation(index)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleOpenEducationDialog(index)}
                  sx={{ position: 'absolute', right: 40, top: 8 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle1">{edu.school}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {edu.degree} in {edu.field}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {edu.start_year} - {edu.current ? 'Present' : edu.end_year}
                </Typography>
              </Paper>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenEducationDialog()}
            >
              Add Education
            </Button>
          </Box>
        </Grid>

        {/* Experience Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Experience
            </Typography>
            {formData.experience.map((exp, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveExperience(index)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleOpenExperienceDialog(index)}
                  sx={{ position: 'absolute', right: 40, top: 8 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle1">{exp.position}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {exp.company}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                </Typography>
                <Typography variant="body2">{exp.description}</Typography>
              </Paper>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => handleOpenExperienceDialog()}
            >
              Add Experience
            </Button>
          </Box>
        </Grid>

        {/* Skills Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Skills
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Add Skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button onClick={handleAddSkill}>Add</Button>
            </Stack>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          onClick={onSkip}
          variant="outlined"
          sx={{ 
            borderRadius: 6,
            px: 3,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          sx={{ 
            borderRadius: 6,
            px: 3,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Save Changes
        </Button>
      </Box>

      {/* Education Dialog */}
      <Dialog
        open={isEducationDialogOpen}
        onClose={() => setIsEducationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingEducationIndex >= 0 ? 'Edit Education' : 'Add Education'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="School/University"
                value={newEducation.school}
                onChange={(e) => handleEducationChange('school', e.target.value)}
                required
                error={!!educationErrors.school}
                helperText={educationErrors.school}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Degree"
                value={newEducation.degree}
                onChange={(e) => handleEducationChange('degree', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Field of Study"
                value={newEducation.field}
                onChange={(e) => handleEducationChange('field', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newEducation.current}
                    onChange={(e) => setNewEducation(prev => ({
                      ...prev,
                      current: e.target.checked,
                      end_year: e.target.checked ? '' : prev.end_year
                    }))}
                  />
                }
                label="Currently attending"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Year"
                value={newEducation.start_year}
                onChange={(e) => handleEducationChange('start_year', e.target.value)}
                required
                error={!!educationErrors.start_year}
                helperText={educationErrors.start_year || "e.g., 2018"}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Year"
                value={newEducation.end_year}
                onChange={(e) => handleEducationChange('end_year', e.target.value)}
                disabled={newEducation.current}
                placeholder={newEducation.current ? "Present" : ""}
                required={!newEducation.current}
                error={!!educationErrors.end_year}
                helperText={educationErrors.end_year || "e.g., 2022"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEducationDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddEducation} 
            variant="contained"
            disabled={Object.keys(educationErrors).some(key => !!educationErrors[key])}
          >
            {editingEducationIndex >= 0 ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog
        open={isExperienceDialogOpen}
        onClose={() => setIsExperienceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingExperienceIndex >= 0 ? 'Edit Experience' : 'Add Experience'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company"
                value={newExperience.company}
                onChange={(e) => handleExperienceChange('company', e.target.value)}
                required
                error={!!experienceErrors.company}
                helperText={experienceErrors.company}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position"
                value={newExperience.position}
                onChange={(e) => handleExperienceChange('position', e.target.value)}
                required
                error={!!experienceErrors.position}
                helperText={experienceErrors.position}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newExperience.current}
                    onChange={(e) => setNewExperience(prev => ({
                      ...prev,
                      current: e.target.checked,
                      end_date: e.target.checked ? '' : prev.end_date
                    }))}
                  />
                }
                label="I currently work here"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={newExperience.start_date}
                onChange={(e) => handleExperienceChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                error={!!experienceErrors.start_date}
                helperText={experienceErrors.start_date}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={newExperience.end_date}
                onChange={(e) => handleExperienceChange('end_date', e.target.value)}
                disabled={newExperience.current}
                InputLabelProps={{ shrink: true }}
                placeholder={newExperience.current ? "Present" : ""}
                required={!newExperience.current}
                error={!!experienceErrors.end_date}
                helperText={experienceErrors.end_date}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newExperience.description}
                onChange={(e) => handleExperienceChange('description', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsExperienceDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddExperience} 
            variant="contained"
            disabled={Object.keys(experienceErrors).some(key => !!experienceErrors[key])}
          >
            {editingExperienceIndex >= 0 ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileDetails; 