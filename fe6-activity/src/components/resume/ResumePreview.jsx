import React from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Button,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getTemplateById } from '../../components/templates';
import {
  ActionButton,
  ResumePreviewContainer,
  PreviewPaper
} from '../../pages/ResumeBuilder.styles';
import ResumeEditor from './ResumeEditor';

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

const ResumePreview = ({
  error,
  loading,
  resumeData,
  isEditing,
  setIsEditing,
  handleSaveChanges,
  componentRef,
  selectedTemplate,
  
  // Edit state
  basics,
  summary,
  setSummary,
  setBasics,
  education,
  setEducation,
  experience,
  setExperience,
  skills,
  setSkills,
  projects,
  setProjects,
  sections,
  setSections,
  sectionOrder,
  setSectionOrder,
  
  // Edit functions
  updateEducation,
  removeEducation,
  addEducation,
  updateExperience,
  removeExperience,
  addExperience,
  updateProject,
  removeProject,
  addProject,
  updateProjectSkills,
  updateSectionTitle,
  removeSection,
  addSection,
  addBulletPoint,
  updateBulletPoint,
  removeBulletPoint,
  moveSection,
  expandedSection,
  setExpandedSection,
  handleEditToggle
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      {error && (
        isQuotaError(error) ? (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fff6f6 0%, #ffe9e9 100%)',
              border: '1px solid #ffcccc'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ErrorOutlineIcon 
                color="error" 
                sx={{ fontSize: 40, mr: 2 }} 
              />
              <Typography variant="h5" color="error" fontWeight="bold">
                API Quota Exceeded
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                href="/dashboard"
              >
                Return to Dashboard
              </Button>
            </Box>
          </Paper>
        ) : (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            {resumeData && (
              <ActionButton
                variant="contained"
                color="primary"
                onClick={() => isEditing ? handleSaveChanges() : handleEditToggle()}
                startIcon={isEditing ? <DownloadIcon /> : <EditIcon />}
              >
                {isEditing ? 'Save Changes' : 'Edit Resume'}
              </ActionButton>
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: isEditing ? 'row' : 'column' }, 
            gap: 3,
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: isEditing ? 'flex-start' : 'center' }
          }}>
            {/* Resume Preview Section */}
            <ResumePreviewContainer 
              id="resume-preview"
              sx={{ 
                width: isEditing ? { xs: '100%', md: '50%' } : '100%',
                maxHeight: isEditing ? { xs: '50vh', md: '70vh' } : '70vh',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              <PreviewPaper id="resume-preview12" ref={componentRef} elevation={3}>
                {(() => {
                  const SelectedTemplate = getTemplateById(selectedTemplate);
                  if (!SelectedTemplate) {
                    return <Alert severity="error">Template not found</Alert>;
                  }

                  const previewData = isEditing ? {
                    basics: {
                      name: basics.name || '',
                      email: basics.email || '',
                      phone: basics.phone || '',
                      location: basics.location || '',
                      profiles: basics.profiles || {}
                    },
                    summary: summary || '',
                    education: education || [],
                    experience: experience || [],
                    skills: skills || [],
                    projects: projects || [],
                    sections: (sections || []).filter(section => 
                      !['personal', 'experience', 'education', 'skills', 'projects'].includes(section.id)
                    ).map(section => ({
                      id: section.id,
                      title: section.title,
                      content: section.content,
                      bullets: section.bullets || []
                    })),
                    sectionOrder: sectionOrder || ['contact', 'summary', 'experience', 'education', 'skills', 'projects', 'custom']
                  } : (resumeData || {
                    basics: {
                      name: '',
                      email: '',
                      phone: '',
                      location: '',
                      profiles: {}
                    },
                    summary: '',
                    education: [],
                    experience: [],
                    skills: [],
                    projects: [],
                    sections: [],
                    sectionOrder: ['contact', 'summary', 'experience', 'education', 'skills', 'projects', 'custom']
                  });

                  return <SelectedTemplate resumeData={previewData} />;
                })()}
              </PreviewPaper>
            </ResumePreviewContainer>

            {/* Resume Editor - Appears in Editing Mode */}
            {isEditing && resumeData && (
              <Box sx={{ 
                width: { xs: '100%', md: '45%' },
                transition: 'width 0.3s ease-in-out'
              }}>
                <ResumeEditor
                  basics={basics}
                  setBasics={setBasics}
                  summary={summary}
                  setSummary={setSummary}
                  education={education}
                  experience={experience}
                  skills={skills}
                  setSkills={setSkills}
                  projects={projects}
                  sections={sections}
                  sectionOrder={sectionOrder}
                  updateEducation={updateEducation}
                  removeEducation={removeEducation}
                  addEducation={addEducation}
                  updateExperience={updateExperience}
                  removeExperience={removeExperience}
                  addExperience={addExperience}
                  updateProject={updateProject}
                  removeProject={removeProject}
                  addProject={addProject}
                  updateProjectSkills={updateProjectSkills}
                  updateSectionTitle={updateSectionTitle}
                  removeSection={removeSection}
                  addSection={addSection}
                  addBulletPoint={addBulletPoint}
                  updateBulletPoint={updateBulletPoint}
                  removeBulletPoint={removeBulletPoint}
                  moveSection={moveSection}
                  expandedSection={expandedSection}
                  setExpandedSection={setExpandedSection}
                  handleSaveChanges={handleSaveChanges}
                />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ResumePreview;
