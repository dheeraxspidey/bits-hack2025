import React, { useEffect, useRef } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import {
  ResumeContainer,
  Section,
  ModernSectionTitle,
  ModernHeader,
  ExperienceItem,
  SkillsContainer,
  ProjectItem,
  PrintStyles,
  ContentContainer
} from './styles';

const ModernTemplate = ({ resumeData }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!resumeData) return;

    // Function to adjust content scale if it overflows
    const adjustScale = () => {
      const content = contentRef.current;
      if (!content) return;

      // Only adjust scale in preview mode, not when printing
      if (!window.matchMedia('print').matches) {
        // Reset scale to measure true height
        content.style.transform = 'scale(1)';
        const contentHeight = content.scrollHeight;
        const containerHeight = content.parentElement.clientHeight;

        if (contentHeight > containerHeight) {
          const scale = containerHeight / contentHeight;
          content.style.transform = `scale(${scale})`;
        }
      }
    };

    adjustScale();
    window.addEventListener('resize', adjustScale);
    return () => window.removeEventListener('resize', adjustScale);
  }, [resumeData]);

  if (!resumeData) {
    return (
      <ResumeContainer id="resume-preview" sx={PrintStyles}>
        <ContentContainer>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="error">No resume data available</Typography>
            <Typography variant="body2">Please try generating your resume again.</Typography>
          </Box>
        </ContentContainer>
      </ResumeContainer>
    );
  }

  const { basics = {}, education = [], experience = [], skills = [], projects = [], sectionOrder = [
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'custom'
  ] } = resumeData;

  const renderSection = (sectionType) => {
    switch (sectionType) {
      case 'summary':
        // Only render the summary section if there's actual content
        if (resumeData.summary === undefined || resumeData.summary === '') {
          return null;
        }
        return (
          <Section key="summary">
            <ModernSectionTitle>Professional Summary</ModernSectionTitle>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {resumeData.summary}
            </Typography>
          </Section>
        );
      case 'experience':
        return (
          <Section key="experience">
            <ModernSectionTitle>Experience</ModernSectionTitle>
            {experience.map((exp, index) => (
              <ExperienceItem key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {exp.position}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {exp.company} • {exp.period}
                </Typography>
                {exp.description && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {exp.description}
                  </Typography>
                )}
              </ExperienceItem>
            ))}
          </Section>
        );
      case 'education':
        return (
          <Section key="education">
            <ModernSectionTitle>Education</ModernSectionTitle>
            {education.map((edu, index) => (
              <ExperienceItem key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {edu.degree} in {edu.field}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {edu.school} • {edu.period}
                </Typography>
                {edu.description && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {edu.description}
                  </Typography>
                )}
              </ExperienceItem>
            ))}
          </Section>
        );
      case 'skills':
        return (
          <Section key="skills">
            <ModernSectionTitle>Skills</ModernSectionTitle>
            <SkillsContainer>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </SkillsContainer>
          </Section>
        );
      case 'projects':
        return (
          <Section key="projects">
            <ModernSectionTitle>Projects</ModernSectionTitle>
            {projects.map((project, index) => (
              <ProjectItem key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {project.title}
                </Typography>
                {project.description && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {project.description}
                  </Typography>
                )}
                {project.skills && project.skills.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {project.skills.map((skill, skillIndex) => (
                      <Typography
                        key={skillIndex}
                        variant="caption"
                        color="textSecondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {skill}{skillIndex < project.skills.length - 1 ? ', ' : ''}
                      </Typography>
                    ))}
                  </Box>
                )}
              </ProjectItem>
            ))}
          </Section>
        );
      case 'custom':
        return resumeData.sections?.filter(section => 
          !['personal', 'experience', 'education', 'skills'].includes(section.id)
        ).map(section => (
          <Section key={section.id}>
            <ModernSectionTitle>{section.title}</ModernSectionTitle>
            <Box sx={{ pl: 2 }}>
              {section.bullets.map((bullet, bulletIndex) => (
                <Typography 
                  key={bulletIndex} 
                  variant="body2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    mb: 0.5,
                    '&:before': {
                      content: '"•"',
                      marginRight: '8px',
                      marginLeft: '-16px'
                    }
                  }}
                >
                  {bullet}
                </Typography>
              ))}
            </Box>
          </Section>
        ));
      default:
        return null;
    }
  };

  return (
    <ResumeContainer id="resume-preview" sx={PrintStyles}>
      <ContentContainer>
        <Box ref={contentRef}>
          {/* Header Section */}
          <ModernHeader>
            <Typography variant="h4" gutterBottom>
              {basics.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {basics.email} • {basics.location}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {basics.profiles.linkedin && (
                <Typography variant="body2" color="textSecondary">
                  LinkedIn: {basics.profiles.linkedin}
                </Typography>
              )}
              {basics.profiles.github && (
                <Typography variant="body2" color="textSecondary">
                  GitHub: {basics.profiles.github}
                </Typography>
              )}
            </Box>
          </ModernHeader>

          {/* Render sections in order */}
          {sectionOrder.map(sectionType => renderSection(sectionType))}
        </Box>
      </ContentContainer>
    </ResumeContainer>
  );
};

export default ModernTemplate; 