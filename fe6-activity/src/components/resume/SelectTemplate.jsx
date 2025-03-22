import React from 'react';
import { Grid, Typography } from '@mui/material';
import { templates } from '../templates';
import { SectionPaper } from '../../pages/ResumeBuilder.styles';

const SelectTemplate = ({ selectedTemplate, setSelectedTemplate }) => {
  return (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid item xs={12} sm={6} md={4} key={template.id}>
          <SectionPaper
            elevation={selectedTemplate === template.id ? 8 : 3}
            sx={{
              overflow: 'hidden',
              border: selectedTemplate === template.id 
                ? '3px solid #1976d2'  // Stay highlighted when selected
                : '2px solid transparent', // No border for unselected items
              
              backgroundColor: selectedTemplate === template.id 
                ? 'rgba(25, 118, 210, 0.2)'  // Light blue background when selected
                : 'transparent', // Normal background when not selected
              
              transition: 'all 0.3s ease-in-out',
              cursor: 'pointer',

              '&:hover': {
                border: '2px solid #1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                '& img': {
                  transform: 'scale(1.01) translateZ(0)', // Minimal zoom with hardware acceleration
                  imageRendering: 'auto'
                }
              },
            }}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <img 
              src={template.image}
              srcSet={`
                ${template.image}?w=400 400w,
                ${template.image}?w=800 800w,
                ${template.image}?w=1200 1200w
              `}
              sizes="(max-width: 600px) 100vw, 50vw"
              alt={template.name}
              style={{
                width: '100%',
                height: '240px',
                objectFit: 'cover',
                objectPosition: 'top',
                borderRadius: '4px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                zIndex: 1,
                imageRendering: 'auto', // Best for photographic content
                transform: 'translateZ(0)', // Hardware acceleration
                backfaceVisibility: 'hidden',
                aspectRatio: '3/4',
                transition: 'all 0.3s ease-in-out'
              }}
            />
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 600, 
              color: selectedTemplate === template.id ? 'primary.main' : 'text.primary'
            }}>
              {template.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {template.description}
            </Typography>
          </SectionPaper>
        </Grid>
      ))}
    </Grid>
  );
};

export default SelectTemplate;
