import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, styled } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import axios from 'axios';
import {
  ResumeContainer,
  Section,
  ContentContainer,
  ProfileImageContainer
} from './styles';

const base_url = import.meta.env.VITE_API_BASE_URL;

const SidebarTemplate = ({ resumeData }) => {
  
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    // Only fetch from API if resumeData doesn't already have a profile_image
    if (!resumeData?.profile_image) {
      const fetchUserImage = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${base_url}/api/user/profile/image`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              responseType: 'arraybuffer'
            }
          );
          
          const base64Image = Buffer.from(response.data, 'binary').toString('base64');
          setUserImage(base64Image);
        } catch (error) {
          console.error('Error fetching user image:', error);
        }
      };

      fetchUserImage();
    }
  }, [resumeData?.profile_image]);

  if (!resumeData) {
    return (
      <ResumeContainer id="resume-preview">
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="error">No resume data available</Typography>
          <Typography variant="body2">Please try generating your resume again.</Typography>
        </Box>
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

  // Function to render skill level bars instead of dots for better visibility
  const renderSkillLevel = (level) => {
    return (
      <Box sx={{ 
        width: '100%', 
        height: 3, 
        bgcolor: 'rgba(255,255,255,0.2)', 
        borderRadius: 1,
        mt: 0.5
      }}>
        <Box sx={{ 
          width: `${(level/5) * 100}%`, 
          height: '100%', 
          bgcolor: 'white',
          borderRadius: 1
        }} />
      </Box>
    );
  };

  // Function to render different sections based on section type
  const renderSection = (sectionType) => {
    switch (sectionType) {
      case 'summary':
        // Only render the summary section if there's actual content
        if (resumeData.summary === undefined || resumeData.summary === '') {
          return null;
        }
        return (
          <Section key="summary">
            <Typography variant="h6" sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              borderBottom: '2px solid #006989',
              pb: 0.5,
              color: '#006989',
              fontSize: '1rem'
            }}>
              SUMMARY
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {resumeData.summary}
            </Typography>
          </Section>
        );
      case 'experience':
        return (
          <Section key="experience">
            <Typography variant="h6" sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              borderBottom: '2px solid #006989',
              pb: 0.5,
              color: '#006989',
              fontSize: '1rem'
            }}>
              EXPERIENCE
            </Typography>
            {experience.map((exp, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {exp.position}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  {exp.company} • {exp.period}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                  {exp.description}
                </Typography>
              </Box>
            ))}
          </Section>
        );
      case 'education':
        return (
          <Section key="education">
            <Typography variant="h6" sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              borderBottom: '2px solid #006989',
              pb: 0.5,
              color: '#006989',
              fontSize: '1rem'
            }}>
              EDUCATION
            </Typography>
            {education.map((edu, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {edu.degree} in {edu.field}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  {edu.school} • {edu.period}
                </Typography>
                {edu.description && (
                  <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                    {edu.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Section>
        );
      case 'projects':
        return (
          <Section key="projects">
            <Typography variant="h6" sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              borderBottom: '2px solid #006989',
              pb: 0.5,
              color: '#006989',
              fontSize: '1rem'
            }}>
              PROJECTS
            </Typography>
            {projects.map((project, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {project.title}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                  {project.period}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                  {project.description}
                </Typography>
              </Box>
            ))}
          </Section>
        );
      case 'custom':
        return resumeData.sections?.filter(section => 
          !['personal', 'experience', 'education', 'skills'].includes(section.id)
        ).map(section => (
          <Section key={section.id}>
            <Typography variant="h6" sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              borderBottom: '2px solid #006989',
              pb: 0.5,
              color: '#006989',
              fontSize: '1rem'
            }}>
              {section.title}
            </Typography>
            <Box sx={{ pl: 2 }}>
              {section.bullets.map((bullet, bulletIndex) => (
                <Typography 
                  key={bulletIndex} 
                  variant="body2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    mb: 0.5,
                    lineHeight: 1.4,
                    '&:before': {
                      content: '"•"',
                      marginRight: '6px',
                      marginLeft: '-12px'
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
    <ResumeContainer id="resume-preview">
      <Box sx={{ 
        display: 'flex', 
        minHeight: '10in',
        maxHeight: '10in',
        overflow: 'hidden',
        '@media print': {
          height: '10in !important',
          overflow: 'hidden',
          pageBreakInside: 'avoid'
        }
      }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: '30%',
            bgcolor: '#006989',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            pt: 0,
            '@media print': {
              bgcolor: '#006989 !important',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              height: '10in !important'
            }
          }}
        >
          {/* Profile Image Container */}
          <Box 
            sx={{ 
              width: '100%',
              height: '120px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              mb: 1,
              '@media print': {
                backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                height: '120px !important',
                overflow: 'visible !important'
              }
            }}
          >
            <ProfileImageContainer>
              <Avatar
                src={resumeData.profile_image 
                  ? `data:image/jpeg;base64,${resumeData.profile_image}` 
                  : userImage 
                    ? `data:image/jpeg;base64,${userImage}` 
                    : '/default-avatar.png'}
                alt={basics.name}
                sx={{
                  width: 90,
                  height: 90,
                  border: '2px solid white',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  backgroundColor: 'white',
                  '@media print': {
                    border: '2px solid white !important',
                    borderRadius: '50% !important',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15) !important',
                    backgroundColor: 'white !important',
                    width: '90px !important',
                    height: '90px !important',
                    '& img': {
                      borderRadius: '50% !important'
                    }
                  }
                }}
              />
            </ProfileImageContainer>
          </Box>

          {/* Sidebar Content */}
          <Box sx={{ p: 1.25, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {/* Contact Information */}
            <Section>
              <Typography variant="h6" sx={{ 
                mb: 0.75, 
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                pb: 0.25,
                fontSize: '0.8rem'
              }}>
                CONTACT
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <EmailIcon sx={{ fontSize: '0.8rem' }} />
                  <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{basics.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <PhoneIcon sx={{ fontSize: '0.8rem' }} />
                  <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{basics.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <LocationOnIcon sx={{ fontSize: '0.8rem' }} />
                  <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{basics.location}</Typography>
                </Box>
                {basics.profiles?.linkedin && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <LinkedInIcon sx={{ fontSize: '0.8rem' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{basics.profiles.linkedin}</Typography>
                  </Box>
                )}
                {basics.profiles?.github && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <GitHubIcon sx={{ fontSize: '0.8rem' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>{basics.profiles.github}</Typography>
                  </Box>
                )}
              </Box>
            </Section>

            {/* Skills Section */}
            <Section>
              <Typography variant="h6" sx={{ 
                mb: 0.75, 
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(255,255,255,0.3)',
                pb: 0.25,
                fontSize: '0.8rem'
              }}>
                SKILLS
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {skills.map((skill, index) => (
                  <Box key={index}>
                    <Typography variant="body2" sx={{ mb: 0.25, fontSize: '0.7rem' }}>
                      {skill}
                    </Typography>
                    {renderSkillLevel(4)}
                  </Box>
                ))}
              </Box>
            </Section>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          width: '70%', 
          p: 1.25, 
          bgcolor: 'white',
          overflowY: 'hidden',
          '@media print': {
            overflowY: 'hidden !important'
          }
        }}>
          {/* Header */}
          <Box sx={{ mb: 1.25 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              mb: 0.25,
              color: '#006989',
              fontSize: '1.3rem'
            }}>
              {basics.name}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'text.secondary', 
              mb: 0.5,
              fontWeight: 500,
              fontSize: '0.85rem'
            }}>
              {basics.label}
            </Typography>
          </Box>

          {/* Main content sections */}
          <Box sx={{ 
            overflowY: 'hidden',
            maxHeight: 'calc(10in - 2in)',
            '@media print': {
              overflowY: 'hidden !important'
            }
          }}>
            {sectionOrder.map(sectionType => renderSection(sectionType))}
          </Box>
        </Box>
      </Box>
    </ResumeContainer>
  );
};

export default SidebarTemplate; 