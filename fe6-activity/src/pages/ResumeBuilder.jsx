import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
  FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { templates, getTemplateById } from '../components/templates';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Container,
  ContentWrapper,
  Title,
  StyledStepper,
  ContentPaper,
  ButtonContainer,
  NavigationButtons,
  StyledButton,
  ActionButton,
  ResumePreviewContainer,
  PreviewPaper,
  EditContainer,
  SectionPaper,
  ItemBox,
  StyledSelect,
  ActivityChip,
  ActivityMenuItem,
  ActivityCard,
  QuotaErrorAlert
} from './ResumeBuilder.styles';
import SelectTemplate from '../components/resume/SelectTemplate';
import SelectResumeType from '../components/resume/SelectResumeType';
import SelectActivities from '../components/resume/SelectActivities';
import ResumePreview from '../components/resume/ResumePreview';
import ResumeEditor from '../components/resume/ResumeEditor';
const base_url = import.meta.env.VITE_API_BASE_URL;

const steps = ['Select Template', 'Select Resume Type', 'Select Activities', 'Preview & Edit'];

// Rich text editor styles
const styleMap = {
  'BOLD': { fontWeight: 'bold' },
  'ITALIC': { fontStyle: 'italic' },
  'UNDERLINE': { textDecoration: 'underline' },
};

// Initial resume sections
const initialSections = [
  { id: 'personal', title: 'Personal Information', content: EditorState.createEmpty(), bullets: [] },
  { id: 'experience', title: 'Work Experience', content: EditorState.createEmpty(), bullets: [] },
  { id: 'education', title: 'Education', content: EditorState.createEmpty(), bullets: [] },
  { id: 'skills', title: 'Skills', content: EditorState.createEmpty(), bullets: [] },
];

// Add initial basics state
const initialBasics = {
  name: '',
  email: '',
  phone: '',
  location: '',
  profiles: []
};

// Add initial education and experience states
const initialSummary = '';
const initialEducation = [];
const initialExperience = [];

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const componentRef = useRef(null);
  const { control, handleSubmit, setValue, watch } = useForm();
  
  // States
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [resumeType, setResumeType] = useState('general');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sections, setSections] = useState(initialSections);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [basics, setBasics] = useState(initialBasics);
  const [summary, setSummary] = useState(initialSummary);
  const [education, setEducation] = useState(initialEducation);
  const [experience, setExperience] = useState(initialExperience);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([
    'contact',
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'custom',
  ]);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [expandedSection, setExpandedSection] = useState('personal');
  const [predefinedJobTitles] = useState([
    'Software Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Full Stack Developer',
    'Backend Developer',
    'Frontend Developer',
    'DevOps Engineer',
    'Cloud Solutions Engineer',
    'Systems Engineer',
    'Research Engineer',
    'AI Engineer',
    'Mobile App Developer',
    'Embedded Systems Engineer',
    'Quality Assurance Engineer',
    'Database Engineer',
    'Network Engineer',
    'Security Engineer',
    'Product Manager',
    'UX/UI Designer',
    'Technical Analyst',
    'Robotics Engineer',
    'IoT Developer',
    'Blockchain Developer',
    'Computer Vision Engineer'
  ]);

  useEffect(() => {
    fetchUserData();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (userData && !resumeData && !isEditing) {
      setBasics({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        profiles: {
          linkedin: userData.linkedin || '',
          github: userData.github || ''
        }
      });
      
      // Set summary separately
      setSummary(userData.bio || '');
      
      // Format skills with fallbacks
      const formattedSkills = Array.isArray(userData.skills) 
        ? userData.skills.map(skill => {
            if (typeof skill === 'string') return skill;
            return skill.name || skill.title || '';
          })
        : [];
      
      // Format projects with proper structure
      const formattedProjects = Array.isArray(userData.projects)
        ? userData.projects.map(project => ({
            title: project.title || project.name || '',
            description: project.description || '',
            skills: Array.isArray(project.skills) 
              ? project.skills.map(skill => typeof skill === 'string' ? skill : skill.name || skill.title || '')
              : [],
            // Add date fields for proper editing
            start_date: project.start_date || '',
            end_date: project.end_date || '',
            current: project.current || false
          }))
        : [];
        
        setSkills(formattedSkills);
        setProjects(formattedProjects);
    }
  }, [userData, resumeData, isEditing]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${base_url}/api/user/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${base_url}/api/activities`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
    }
  };

  // Add these new functions for moving items up/down
  const moveItem = (array, index, direction) => {
    if (direction === 'up' && index > 0) {
      const newArray = [...array];
      [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
      return newArray;
    }
    if (direction === 'down' && index < array.length - 1) {
      const newArray = [...array];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      return newArray;
    }
    return array;
  };

  const moveEducation = (index, direction) => {
    const newEducation = moveItem(education, index, direction);
    setEducation(newEducation);
    updateResumeData({ education: newEducation });
  };

  const moveExperience = (index, direction) => {
    const newExperience = moveItem(experience, index, direction);
    setExperience(newExperience);
    updateResumeData({ experience: newExperience });
  };

  const moveProject = (index, direction) => {
    const newProjects = moveItem(projects, index, direction);
    setProjects(newProjects);
    updateResumeData({ projects: newProjects });
  };

  const moveCustomSection = (index, direction) => {
    const customSections = sections.filter(section => 
      !['personal', 'experience', 'education', 'skills'].includes(section.id)
    );
    const newCustomSections = moveItem(customSections, index, direction);
    const updatedSections = [
      ...sections.filter(section => 
        ['personal', 'experience', 'education', 'skills'].includes(section.id)
      ),
      ...newCustomSections
    ];
    setSections(updatedSections);
    updateResumeData({ sections: updatedSections });
  };

  // Helper function to update resume data
  const updateResumeData = (updates) => {
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        ...updates
      };
      setResumeData(updatedResumeData);
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderArray = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    // Handle reordering within the same list
    if (result.source.droppableId === result.destination.droppableId) {
      switch (result.source.droppableId) {
        case 'education':
          const reorderedEducation = reorderArray(
            education,
            result.source.index,
            result.destination.index
          );
          setEducation(reorderedEducation);
          break;
        case 'experience':
          const reorderedExperience = reorderArray(
            experience,
            result.source.index,
            result.destination.index
          );
          setExperience(reorderedExperience);
          break;
        case 'projects':
          const reorderedProjects = reorderArray(
            projects,
            result.source.index,
            result.destination.index
          );
          setProjects(reorderedProjects);
          break;
        case 'custom-sections':
          const filteredSections = sections.filter(section => 
            !['personal', 'experience', 'education', 'skills'].includes(section.id)
          );
          const reorderedSections = reorderArray(
            filteredSections,
            result.source.index,
            result.destination.index
          );
          const updatedSections = sections.filter(section => 
            ['personal', 'experience', 'education', 'skills'].includes(section.id)
          ).concat(reorderedSections);
          setSections(updatedSections);
          break;
      }

      // Update resume data after reordering
      if (resumeData) {
        const updatedResumeData = {
          ...resumeData,
          basics: basics,
          education: education,
          experience: experience,
          projects: projects,
          sections: sections
        };
        setResumeData(updatedResumeData);
      }
    }
  };

  // Rich text editor handlers
  const handleEditorChange = (editorState, sectionId) => {
    const newSections = sections.map(section => 
      section.id === sectionId ? { ...section, content: editorState } : section
    );
    setSections(newSections);
  };

  const handleKeyCommand = (command, editorState, sectionId) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState, sectionId);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style, sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newState = RichUtils.toggleInlineStyle(section.content, style);
      handleEditorChange(newState, sectionId);
    }
  };

  // Section management
  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      content: EditorState.createEmpty(),
      bullets: ['']
    };
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    
    // Update resume data to include the new section
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  const removeSection = (sectionId) => {
    const updatedSections = sections.filter(section => section.id !== sectionId);
    setSections(updatedSections);
    
    // Update resume data to reflect removed section
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  const updateSectionTitle = (sectionId, newTitle) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, title: newTitle } : section
    );
    setSections(updatedSections);
    
    // Update resume data with new section title
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  // Update bullet point functions to also update resumeData
  const addBulletPoint = (sectionId) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, bullets: [...section.bullets, ''] }
        : section
    );
    setSections(updatedSections);
    
    // Update resume data with new bullet point
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  const updateBulletPoint = (sectionId, bulletIndex, value) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            bullets: section.bullets.map((bullet, idx) =>
              idx === bulletIndex ? value : bullet
            )
          }
        : section
    );
    setSections(updatedSections);
    
    // Update resume data with updated bullet point
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  const removeBulletPoint = (sectionId, bulletIndex) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            bullets: section.bullets.filter((_, idx) => idx !== bulletIndex)
          }
        : section
    );
    setSections(updatedSections);
    
    // Update resume data with removed bullet point
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        sections: updatedSections
      };
      setResumeData(updatedResumeData);
    }
  };

  // Generate resume data
  const generateResumeData = () => {
    // Make sure we extract just the titles from selectedActivities
    const selectedActivityTitles = selectedActivities.map(activity => 
      typeof activity === 'object' ? activity.title : activity
    );
    
    // Format education entries with proper period field
    const formattedEducation = education.map(edu => {
      // Keep the original fields but add a period field for display
      return {
        ...edu,
        period: `${edu.start_year || ''} - ${edu.current ? 'Present' : (edu.end_year || '')}`
      };
    });

    // Format experience entries with proper period field
    const formattedExperience = experience.map(exp => {
      // Keep the original fields but add a period field for display
      return {
        ...exp,
        period: `${exp.start_date || ''} - ${exp.current ? 'Present' : (exp.end_date || '')}`
      };
    });
    
    // Format project entries with proper period field
    const formattedProjects = projects.map(project => {
      // Keep the original fields but add a period field for display
      return {
        ...project,
        period: project.start_date || project.end_date ? 
          `${project.start_date || ''} - ${project.current ? 'Present' : (project.end_date || '')}` : 
          ''
      };
    });
    
    return {
      template: selectedTemplate,
      type: resumeType,
      job_title: jobTitle,
      selected_activities: selectedActivityTitles,
      sections: sections.map(section => ({
        id: section.id,
        title: section.title,
        bullets: section.bullets || []
      })),
      basics: {
        ...basics,
        profiles: basics.profiles || {}
      },
      summary: summary || '',
      education: formattedEducation,
      experience: formattedExperience,
      skills: skills,
      projects: formattedProjects
    };
  };

  const generateResume = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const data = generateResumeData();
      const response = await axios.post(
        `${base_url}/api/resume/generate`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.generated_content) {
        // Parse the generated content
        const generatedResumeData = JSON.parse(response.data.generated_content);
        
        // Create a default summary if none is provided
        if (generatedResumeData.summary === undefined) {
          generatedResumeData.summary = "Professional with experience in " + (jobTitle || "the field") + ". Skilled in " + 
            (generatedResumeData.skills && generatedResumeData.skills.length > 0 
              ? generatedResumeData.skills.slice(0, 3).join(", ") 
              : "various technical areas") + 
            ". Seeking to leverage my skills and experience to contribute to organizational success.";
        }
        
        // Set the resume data
        setResumeData({
          ...generatedResumeData
        });
        
        // Update the summary state - always set it, even if it's an empty string
        setSummary(generatedResumeData.summary || '');
        
        // Update other state variables if needed
        if (generatedResumeData.basics) {
          setBasics({
            ...generatedResumeData.basics,
            profiles: generatedResumeData.basics.profiles || {}
          });
        }
        
        if (generatedResumeData.education) {
          setEducation(generatedResumeData.education);
        }
        
        if (generatedResumeData.experience) {
          setExperience(generatedResumeData.experience);
        }
        
        if (generatedResumeData.skills) {
          setSkills(generatedResumeData.skills);
        }
        
        if (generatedResumeData.projects) {
          setProjects(generatedResumeData.projects);
        }
        
        if (generatedResumeData.sectionOrder) {
          setSectionOrder(generatedResumeData.sectionOrder);
        }
      } else {
        setError('Failed to generate resume content');
      }
    } catch (error) {
      // Detailed error logging
      console.error('Error generating resume:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Check for quota exceeded error - expanded to catch more patterns
      const errorMessage = error.response?.data?.error || error.message || '';
      const errorString = JSON.stringify(error).toLowerCase();
      
      console.log('Error message for detection:', errorMessage);
      console.log('Error string for detection:', errorString);
      
      if (error.response?.status === 429 || 
          error.response?.status === 500 ||
          errorMessage.toLowerCase().includes('quota') ||
          errorMessage.toLowerCase().includes('limit') ||
          errorMessage.toLowerCase().includes('exceed') ||
          errorMessage.toLowerCase().includes('exhausted') ||
          errorMessage.toLowerCase().includes('resource') ||
          errorString.includes('quota') ||
          errorString.includes('limit') ||
          errorString.includes('exceed') ||
          errorString.includes('exhausted') ||
          errorString.includes('resource') ||
          errorString.includes('429 resource has been exhausted')) {
        console.log('Quota error detected!');
        setError('API quota exceeded. Please try again later or contact support for a quota increase.');
      } else {
        setError('Failed to generate resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add handleRegenerate function
  const handleRegenerate = async () => {
    setLoading(true);
    setError('');
    try {
      // Save current summary in case API doesn't return one
      const currentSummary = summary;
      
      await generateResume();
      
      // Check if summary was set by generateResume
      if (!resumeData?.summary && currentSummary) {
        setSummary(currentSummary);
        
        // Update resumeData with the summary
        if (resumeData) {
          setResumeData({
            ...resumeData,
            summary: currentSummary
          });
        }
      }
    } catch (error) {
      console.error('Error regenerating resume:', error);
      
      // Detailed error logging
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Check for quota exceeded error - expanded to catch more patterns
      const errorMessage = error.response?.data?.error || error.message || '';
      const errorString = JSON.stringify(error).toLowerCase();
      
      console.log('Error message for detection:', errorMessage);
      console.log('Error string for detection:', errorString);
      
      if (error.response?.status === 429 || 
          error.response?.status === 500 ||
          errorMessage.toLowerCase().includes('quota') ||
          errorMessage.toLowerCase().includes('limit') ||
          errorMessage.toLowerCase().includes('exceed') ||
          errorMessage.toLowerCase().includes('exhausted') ||
          errorMessage.toLowerCase().includes('resource') ||
          errorString.includes('quota') ||
          errorString.includes('limit') ||
          errorString.includes('exceed') ||
          errorString.includes('exhausted') ||
          errorString.includes('resource') ||
          errorString.includes('429 resource has been exhausted')) {
        console.log('Quota error detected!');
        setError('API quota exceeded. Please try again later or contact support for a quota increase.');
      } else {
        setError('Failed to regenerate resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the handleDownloadPDF function
  const handleDownloadPDF = () => {
    try {
      setLoading(true);
      setError('');

      // Find the resume preview container
      const resumePreviewContainer = document.getElementById('resume-preview12');
      if (!resumePreviewContainer) {
        throw new Error('Resume preview not found');
      }

      // Create a temporary container for the print view
      const printContainer = document.createElement('div');
      printContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px;
        overflow: auto;
      `;

      // Find the actual resume content (the PreviewPaper element)
      const resumeContent = resumePreviewContainer.querySelector('div');
      if (!resumeContent) {
        throw new Error('Resume content not found');
      }

      // Clone the resume content
      const resumeClone = resumeContent.cloneNode(true);
      resumeClone.style.cssText = `
        width: 8.5in;
        min-height: 11in;
        padding: 0.3in;
        padding-left: 0.2in;
        background: white;
        margin: 0 auto;
        box-shadow: none;
        overflow: visible;
        max-height: none;
      `;

      // Add the clone to the print container
      printContainer.appendChild(resumeClone);

      // Store original body overflow
      const originalOverflow = document.body.style.overflow;
      
      // Add print container to body
      document.body.appendChild(printContainer);
      document.body.style.overflow = 'hidden'; // Prevent scrolling of main content

      // Print the page
      setTimeout(() => {
        window.print();
        
        // Cleanup after printing
        document.body.removeChild(printContainer);
        document.body.style.overflow = originalOverflow;
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Error preparing resume:', error);
      setError('Failed to prepare resume for printing. Please try again.');
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    // Save current step state before proceeding
    saveStepState(activeStep);
    
    if (activeStep === 2) {
      // Moving from activities to preview
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      
      // Only generate if we haven't generated before or if options have changed
      if (!hasGeneratedOnce || resumeOptionsChanged()) {
        await generateResume();
        setHasGeneratedOnce(true);
      }
    } else {
      // For other steps, just move forward normally
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    // Save current step state before going back
    saveStepState(activeStep);
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Track if resume options have changed since last generation
  const resumeOptionsChanged = () => {
    // Check if template, resume type, job title, or selected activities have changed
    const lastOptions = JSON.parse(localStorage.getItem('lastResumeOptions') || '{}');
    
    const currentOptions = {
      template: selectedTemplate,
      resumeType: resumeType,
      jobTitle: jobTitle,
      selectedActivities: selectedActivities.map(a => typeof a === 'object' ? a.id : a)
    };
    
    // Store current options for future comparison
    localStorage.setItem('lastResumeOptions', JSON.stringify(currentOptions));
    
    // If no previous options stored, consider it changed
    if (!lastOptions.template) return true;
    
    // Compare options
    return (
      lastOptions.template !== currentOptions.template ||
      lastOptions.resumeType !== currentOptions.resumeType ||
      lastOptions.jobTitle !== currentOptions.jobTitle ||
      JSON.stringify(lastOptions.selectedActivities) !== JSON.stringify(currentOptions.selectedActivities)
    );
  };
  
  // Save the state of the current step
  const saveStepState = (step) => {
    const stepStates = JSON.parse(localStorage.getItem('resumeBuilderStepStates') || '{}');
    
    switch (step) {
      case 0:
        stepStates.template = selectedTemplate;
        break;
      case 1:
        stepStates.resumeType = resumeType;
        stepStates.jobTitle = jobTitle;
        break;
      case 2:
        stepStates.selectedActivities = selectedActivities.map(a => typeof a === 'object' ? a.id : a);
        break;
      case 3:
        // Save preview state if needed
        break;
    }
    
    localStorage.setItem('resumeBuilderStepStates', JSON.stringify(stepStates));
  };
  
  // Restore state when navigating between steps
  useEffect(() => {
    const stepStates = JSON.parse(localStorage.getItem('resumeBuilderStepStates') || '{}');
    
    // Only restore state if we have saved state and are not on the first render
    if (Object.keys(stepStates).length > 0) {
      switch (activeStep) {
        case 0:
          if (stepStates.template) {
            setSelectedTemplate(stepStates.template);
          }
          break;
        case 1:
          if (stepStates.resumeType) {
            setResumeType(stepStates.resumeType);
          }
          if (stepStates.jobTitle) {
            setJobTitle(stepStates.jobTitle);
          }
          break;
        case 2:
          // For activities, we need to match the IDs with the actual activity objects
          if (stepStates.selectedActivities && activities.length > 0) {
            const savedActivities = stepStates.selectedActivities;
            const matchedActivities = savedActivities.map(savedId => 
              activities.find(a => a.id === savedId) || savedId
            ).filter(Boolean);
            
            if (matchedActivities.length > 0) {
              setSelectedActivities(matchedActivities);
            }
          }
          break;
      }
    }
  }, [activeStep, activities]);

  // Validation
  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return !!selectedTemplate;
      case 1:
        return resumeType === 'general' || (resumeType === 'specific' && jobTitle.trim());
      case 2:
        return selectedActivities.length > 0;
      case 3:
        return sections.length > 0;
      default:
        return true;
    }
  };

  // Add education entry
  const addEducation = () => {
    setEducation([...education, {
      school: '',
      degree: '',
      field: '',
      start_year: '',
      end_year: '',
      current: false,
      description: ''
    }]);
  };

  // Update education entry
  const updateEducation = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEducation(newEducation);
  };

  // Remove education entry
  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Add experience entry
  const addExperience = () => {
    setExperience([...experience, {
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      current: false,
      description: ''
    }]);
  };

  // Update experience entry
  const updateExperience = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setExperience(newExperience);
  };

  // Remove experience entry
  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Add project entry
  const addProject = () => {
    setProjects([...projects, {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      current: false,
      skills: []
    }]);
  };

  // Update project entry
  const updateProject = (index, field, value) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
  };

  // Remove project entry
  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Update project skills
  const updateProjectSkills = (index, skillsString) => {
    const newProjects = [...projects];
    newProjects[index] = { 
      ...newProjects[index], 
      skills: skillsString.split(',').map(skill => skill.trim()).filter(Boolean)
    };
    setProjects(newProjects);
  };

  // Add this new function to handle saving changes
  const handleSaveChanges = () => {
    // Format education entries with proper period field
    const formattedEducation = education.map(edu => {
      const period = `${edu.start_year || ''} - ${edu.current ? 'Present' : (edu.end_year || '')}`;
      return {
        ...edu,
        period: period
      };
    });

    // Format experience entries with proper period field
    const formattedExperience = experience.map(exp => {
      const period = `${exp.start_date || ''} - ${exp.current ? 'Present' : (exp.end_date || '')}`;
      return {
        ...exp,
        period: period
      };
    });
    
    // Format project entries with proper period field
    const formattedProjects = projects.map(project => {
      const period = project.start_date || project.end_date ? 
        `${project.start_date || ''} - ${project.current ? 'Present' : (project.end_date || '')}` : 
        '';
      return {
        ...project,
        period: period
      };
    });
    
    // Create updated resumeData with all current values
    const updatedResumeData = {
      ...resumeData,
      basics,
      summary,
      education: formattedEducation,
      experience: formattedExperience,
      skills,
      projects: formattedProjects,
      sections,
      sectionOrder
    };
    
    setResumeData(updatedResumeData);
    setIsEditing(false);
  };

  // Update the moveSection function to handle section order in preview
  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setSectionOrder(newOrder);
      
      // Create updated resume data with new section order
      const updatedResumeData = {
        ...resumeData,
        sectionOrder: newOrder,
        basics,
        education,
        experience,
        skills,
        projects,
        sections
      };
      setResumeData(updatedResumeData);
      
      // Force a re-render by updating the preview data
      const previewData = {
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
        skills: skills,
        projects: projects,
        sections: sections.map(section => ({
          ...section,
          bullets: section.bullets
        })),
        sectionOrder: newOrder
      };
      setResumeData(previewData);
    } else if (direction === 'down' && index < sectionOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setSectionOrder(newOrder);
      
      // Create updated resume data with new section order
      const updatedResumeData = {
        ...resumeData,
        sectionOrder: newOrder,
        basics,
        education,
        experience,
        skills,
        projects,
        sections
      };
      setResumeData(updatedResumeData);
      
      // Force a re-render by updating the preview data
      const previewData = {
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
        skills: skills,
        projects: projects,
        sections: sections.map(section => ({
          ...section,
          bullets: section.bullets
        })),
        sectionOrder: newOrder
      };
      setResumeData(previewData);
    }
  };

  // Separate functions for moving items within sections
  const moveEducationItem = (index, direction) => {
    const newEducation = [...education];
    if (direction === 'up' && index > 0) {
      [newEducation[index], newEducation[index - 1]] = [newEducation[index - 1], newEducation[index]];
    } else if (direction === 'down' && index < newEducation.length - 1) {
      [newEducation[index], newEducation[index + 1]] = [newEducation[index + 1], newEducation[index]];
    }
    setEducation(newEducation);
    
    // Update resume data
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        education: newEducation
      };
      setResumeData(updatedResumeData);
    }
  };

  const moveExperienceItem = (index, direction) => {
    const newExperience = [...experience];
    if (direction === 'up' && index > 0) {
      [newExperience[index], newExperience[index - 1]] = [newExperience[index - 1], newExperience[index]];
    } else if (direction === 'down' && index < newExperience.length - 1) {
      [newExperience[index], newExperience[index + 1]] = [newExperience[index + 1], newExperience[index]];
    }
    setExperience(newExperience);
    
    // Update resume data
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        experience: newExperience
      };
      setResumeData(updatedResumeData);
    }
  };

  const moveProjectItem = (index, direction) => {
    const newProjects = [...projects];
    if (direction === 'up' && index > 0) {
      [newProjects[index], newProjects[index - 1]] = [newProjects[index - 1], newProjects[index]];
    } else if (direction === 'down' && index < newProjects.length - 1) {
      [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];
    }
    setProjects(newProjects);
    
    // Update resume data
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        projects: newProjects
      };
      setResumeData(updatedResumeData);
    }
  };

  const moveSkillItem = (index, direction) => {
    const newSkills = [...skills];
    if (direction === 'up' && index > 0) {
      [newSkills[index], newSkills[index - 1]] = [newSkills[index - 1], newSkills[index]];
    } else if (direction === 'down' && index < newSkills.length - 1) {
      [newSkills[index], newSkills[index + 1]] = [newSkills[index + 1], newSkills[index]];
    }
    setSkills(newSkills);
    
    // Update resume data
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        skills: newSkills
      };
      setResumeData(updatedResumeData);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <SelectTemplate 
            selectedTemplate={selectedTemplate} 
            setSelectedTemplate={setSelectedTemplate} 
          />
        );

      case 1:
        return (
          <SelectResumeType
            resumeType={resumeType}
            setResumeType={setResumeType}
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            predefinedJobTitles={predefinedJobTitles}
          />
        );

      case 2:
        return (
          <SelectActivities
            activities={activities}
            selectedActivities={selectedActivities}
            setSelectedActivities={setSelectedActivities}
            resumeType={resumeType}
            jobTitle={jobTitle}
            setError={setError}
            base_url={base_url}
          />
        );

      case 3:
        return (
          <ResumePreview
            error={error}
            loading={loading}
            resumeData={resumeData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSaveChanges={handleSaveChanges}
            handleEditToggle={handleEditToggle}
            componentRef={componentRef}
            selectedTemplate={selectedTemplate}
            
            // Edit state
            basics={basics}
            setBasics={setBasics}
            summary={summary}
            setSummary={setSummary}
            education={education}
            setEducation={setEducation}
            experience={experience}
            setExperience={setExperience}
            skills={skills}
            setSkills={setSkills}
            projects={projects}
            setProjects={setProjects}
            sections={sections}
            setSections={setSections}
            sectionOrder={sectionOrder}
            setSectionOrder={setSectionOrder}
            
            // Edit functions
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
          />
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: letter;
          margin: 0;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          background: white;
          height: 100%;
          overflow: hidden !important;
        }
        
        /* Hide everything except the print container */
        body > *:not([style*="z-index: 9999"]) {
          display: none !important;
        }

        /* Style the print view */
        [style*="z-index: 9999"] {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Style the resume content */
        [style*="z-index: 9999"] > * {
          width: 8.5in !important;
          min-height: 11in !important;
          padding: 0.3in !important;
          padding-left: 0.2in !important;  /* Reduced left padding */
          margin: 0 auto !important;
          box-shadow: none !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add this function to handle entering edit mode
  const handleEditToggle = () => {
    if (!isEditing && resumeData) {
      // When entering edit mode, preserve all existing state from resumeData
      
      // Preserve basics
      if (resumeData.basics) {
        setBasics({
          name: resumeData.basics.name || '',
          email: resumeData.basics.email || '',
          phone: resumeData.basics.phone || '',
          location: resumeData.basics.location || '',
          profiles: resumeData.basics.profiles || {}
        });
      }
      
      // Preserve summary
      setSummary(resumeData.summary || '');
      
      // Preserve skills
      if (resumeData.skills) {
        setSkills(resumeData.skills);
      }
      
      // Preserve sections
      if (resumeData.sections) {
        setSections(resumeData.sections);
      }
      
      // Preserve section order
      if (resumeData.sectionOrder) {
        setSectionOrder(resumeData.sectionOrder);
      }
      
      // Format education entries with proper date fields for editing
      if (resumeData.education && resumeData.education.length > 0) {
        const formattedEducation = resumeData.education.map(edu => 
          parsePeriodToDates(edu, 'year')
        );
        setEducation(formattedEducation);
      }
      
      // Format experience entries with proper date fields for editing
      if (resumeData.experience && resumeData.experience.length > 0) {
        const formattedExperience = resumeData.experience.map(exp => 
          parsePeriodToDates(exp, 'date')
        );
        setExperience(formattedExperience);
      }
      
      // Format project entries with proper date fields for editing
      if (resumeData.projects && resumeData.projects.length > 0) {
        const formattedProjects = resumeData.projects.map(proj => 
          parsePeriodToDates(proj, 'date')
        );
        setProjects(formattedProjects);
      }
    }
    setIsEditing(!isEditing);
  };

  // Helper function to parse period strings into dates
  const parsePeriodToDates = (item, type) => {
    const [start, end] = item.period?.split(' - ') || [];
    const isYearFormat = type === 'year';
    
    return {
      ...item,
      start_date: isYearFormat ? start : start || '',
      end_date: end === 'Present' ? '' : end || '',
      current: end === 'Present',
      // For education fields
      start_year: isYearFormat ? start : '',
      end_year: isYearFormat ? (end === 'Present' ? '' : end) : ''
    };
  };

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

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <ContentWrapper>
        <Title variant="h4" gutterBottom>
          Resume Builder
        </Title>
        
        <StyledStepper>
          <Stepper 
            activeStep={activeStep}
            alternativeLabel
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </StyledStepper>

        <ContentPaper elevation={3}>
          {renderStepContent(activeStep)}
        </ContentPaper>

        <ButtonContainer>
          <StyledButton
            variant="outlined"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </StyledButton>
          
          <NavigationButtons>
            <StyledButton
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </StyledButton>
            {activeStep === steps.length - 1 ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <ActionButton
                  variant="contained"
                  onClick={handleRegenerate}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Regenerate Resume
                </ActionButton>
                {resumeData && !loading && (
                  <ActionButton
                    variant="contained"
                    color="secondary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                  >
                    Download PDF
                  </ActionButton>
                )}
              </Box>
            ) : (
              <ActionButton
                variant="contained"
                onClick={handleNext}
                disabled={loading || !isStepValid()}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Next'
                )}
              </ActionButton>
            )}
          </NavigationButtons>
        </ButtonContainer>

        {error && (
          isQuotaError(error) ? (
            <QuotaErrorAlert>
              <div className="error-header">
                <ErrorOutlineIcon className="error-icon" />
                <Typography variant="h5" className="error-title">
                  API Quota Exceeded
                </Typography>
              </div>
              <Typography className="error-message">
                {error}
              </Typography>
              <div className="error-actions">
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/dashboard')}
                >
                  Return to Dashboard
                </Button>
              </div>
            </QuotaErrorAlert>
          ) : (
            <Alert 
              severity="error" 
              sx={{ mt: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )
        )}
      </ContentWrapper>
    </Container>
  );
};

export default ResumeBuilder; 