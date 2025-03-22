import React, { useEffect, useRef } from 'react';
import { Box, Typography, Chip, Divider } from '@mui/material';
import {
  ResumeContainer,
  Section,
  ClassicSectionTitle,
  ClassicHeader,
  ExperienceItem,
  SkillsContainer,
  ProjectItem,
  PrintStyles,
  ContentContainer
} from './styles';

const ClassicTemplate = ({ resumeData }) => {
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
          <Section key="summary" sx={{ mb: 1.5 }}>
            <ClassicSectionTitle>Professional Summary</ClassicSectionTitle>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {resumeData.summary}
            </Typography>
          </Section>
        );
      case 'experience':
        return (
          <Section key="experience">
            <ClassicSectionTitle>Professional Experience</ClassicSectionTitle>
            {experience.map((exp, index) => (
              <ExperienceItem key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {exp.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {exp.period}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {exp.position}
                </Typography>
                {exp.description && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
            <ClassicSectionTitle>Education</ClassicSectionTitle>
            {education.map((edu, index) => (
              <ExperienceItem key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {edu.school}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {edu.period}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {edu.degree} in {edu.field}
                </Typography>
                {edu.description && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
            <ClassicSectionTitle>Technical Skills</ClassicSectionTitle>
            <SkillsContainer>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    borderRadius: '4px',
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              ))}
            </SkillsContainer>
          </Section>
        );
      case 'projects':
        return (
          <Section key="projects">
            <ClassicSectionTitle>Notable Projects</ClassicSectionTitle>
            {projects.map((project, index) => (
              <ProjectItem key={index}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {project.title}
                </Typography>
                {project.description && (
                  <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    {project.description}
                  </Typography>
                )}
                {project.skills && project.skills.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}
                  >
                    {project.skills.join(', ')}
                  </Typography>
                )}
              </ProjectItem>
            ))}
          </Section>
        );
      case 'custom':
        return resumeData.sections?.filter(section => 
          !['personal', 'experience', 'education', 'skills'].includes(section.id)
        ).map(section => (
          <React.Fragment key={section.id}>
            <Section>
              <ClassicSectionTitle>{section.title}</ClassicSectionTitle>
              <Box sx={{ pl: 2 }}>
                {section.bullets.map((bullet, bulletIndex) => (
                  <Typography 
                    key={bulletIndex} 
                    variant="body2" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      mb: 0.5,
                      color: 'text.secondary',
                      '&:before': {
                        content: '"•"',
                        marginRight: '8px',
                        marginLeft: '-16px',
                        color: 'text.primary'
                      }
                    }}
                  >
                    {bullet}
                  </Typography>
                ))}
              </Box>
            </Section>
          </React.Fragment>
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
          <ClassicHeader>
            <Typography variant="h3">
              {basics.name}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 1,
              flexWrap: 'wrap',
              color: 'text.secondary',
              fontSize: '0.9rem'
            }}>
              <Typography>{basics.email}</Typography>
              <Typography>•</Typography>
              <Typography>{basics.location}</Typography>
              {basics.profiles.linkedin && (
                <>
                  <Typography>•</Typography>
                  <Typography>LinkedIn: {basics.profiles.linkedin}</Typography>
                </>
              )}
              {basics.profiles.github && (
                <>
                  <Typography>•</Typography>
                  <Typography>GitHub: {basics.profiles.github}</Typography>
                </>
              )}
            </Box>
          </ClassicHeader>

          <Divider sx={{ mb: 1.5 }} />

          {/* Render sections with reduced spacing */}
          {sectionOrder.map((sectionType, index) => (
            <React.Fragment key={sectionType}>
              {renderSection(sectionType)}
              {index < sectionOrder.length - 1 && <Divider sx={{ my: 1.5 }} />}
            </React.Fragment>
          ))}
        </Box>
      </ContentContainer>
    </ResumeContainer>
  );
};

export default ClassicTemplate; 