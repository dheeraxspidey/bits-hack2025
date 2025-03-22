import React, { useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Alert
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LockIcon from '@mui/icons-material/Lock';
import {
  ActionButton,
  EditContainer,
  SectionPaper,
  ItemBox
} from '../../pages/ResumeBuilder.styles';

// Define the drag type
const ItemTypes = {
  SECTION: 'section'
};

// Non-draggable section component for contact
const NonDraggableSection = ({ 
  sectionType, 
  expandedSection, 
  toggleSectionExpansion,
  children 
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <SectionPaper
        sx={{
          border: expandedSection === sectionType ? '2px solid primary.main' : 'none',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              <LockIcon fontSize="small" />
            </Box>
            <Typography variant="h6">
              {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => toggleSectionExpansion(sectionType)}
          >
            {expandedSection === sectionType ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </Box>
      </SectionPaper>
      {children}
    </Box>
  );
};

// Draggable section component for other sections
const DraggableSection = ({ 
  sectionType, 
  index, 
  moveSection, 
  expandedSection, 
  toggleSectionExpansion,
  children 
}) => {
  const ref = useRef(null);

  // Set up drag
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SECTION,
    item: { type: ItemTypes.SECTION, id: sectionType, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop
  const [, drop] = useDrop({
    accept: ItemTypes.SECTION,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveSection(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Connect drag and drop refs
  drag(drop(ref));

  return (
    <Box 
      ref={ref} 
      sx={{ 
        mb: 2, 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      <SectionPaper
        sx={{
          border: expandedSection === sectionType ? '2px solid primary.main' : 'none',
          backgroundColor: isDragging ? 'rgba(0, 0, 0, 0.05)' : 'inherit',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              <DragIndicatorIcon />
            </Box>
            <Typography variant="h6">
              {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => toggleSectionExpansion(sectionType)}
          >
            {expandedSection === sectionType ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </Box>
      </SectionPaper>
      {children}
    </Box>
  );
};

const ResumeEditor = ({
  // Edit state
  basics,
  setBasics,
  summary,
  setSummary,
  education,
  experience,
  skills,
  setSkills,
  projects,
  sections,
  sectionOrder,
  
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
  handleSaveChanges
}) => {
  // Toggle section expansion
  const toggleSectionExpansion = (sectionType) => {
    setExpandedSection(expandedSection === sectionType ? null : sectionType);
  };

  // Render contact section content
  const renderContactSection = () => (
    <ItemBox>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            value={basics.email}
            onChange={(e) => setBasics({ ...basics, email: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={basics.phone}
            onChange={(e) => setBasics({ ...basics, phone: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="LinkedIn"
            value={basics.profiles?.linkedin || ''}
            onChange={(e) => setBasics({
              ...basics,
              profiles: { ...basics.profiles, linkedin: e.target.value }
            })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="GitHub"
            value={basics.profiles?.github || ''}
            onChange={(e) => setBasics({
              ...basics,
              profiles: { ...basics.profiles, github: e.target.value }
            })}
          />
        </Grid>
      </Grid>
    </ItemBox>
  );

  // Filter out contact from draggable sections
  const draggableSections = sectionOrder.filter(section => section !== 'contact');

  // Custom move section handler for draggable sections
  const handleMoveSection = (fromIndex, toIndex) => {
    // Get the actual section order indices (accounting for contact being removed)
    const fromSectionType = draggableSections[fromIndex];
    const toSectionType = draggableSections[toIndex];
    
    // Find the actual indices in the full sectionOrder array
    const fromSectionIndex = sectionOrder.findIndex(section => section === fromSectionType);
    const toSectionIndex = sectionOrder.findIndex(section => section === toSectionType);
    
    if (fromSectionIndex !== -1 && toSectionIndex !== -1) {
      // Determine direction
      if (fromSectionIndex < toSectionIndex) {
        // Moving down
        for (let i = fromSectionIndex; i < toSectionIndex; i++) {
          moveSection(i, 'down');
        }
      } else {
        // Moving up
        for (let i = fromSectionIndex; i > toSectionIndex; i--) {
          moveSection(i, 'up');
        }
      }
    }
  };

  return (
    <Box className="edit-section">
      <EditContainer>
        {/* Non-draggable contact section always at the top */}
        <NonDraggableSection
          sectionType="contact"
          expandedSection={expandedSection}
          toggleSectionExpansion={toggleSectionExpansion}
        >
          {expandedSection === 'contact' && renderContactSection()}
        </NonDraggableSection>

        {/* Draggable sections */}
        <DndProvider backend={HTML5Backend}>
          {draggableSections.map((sectionType, index) => (
            <DraggableSection
              key={`section-${sectionType}`}
              sectionType={sectionType}
              index={index}
              moveSection={handleMoveSection}
              expandedSection={expandedSection}
              toggleSectionExpansion={toggleSectionExpansion}
            >
              {expandedSection === sectionType && (
                <ItemBox>
                  {sectionType === 'summary' && (
                    <ItemBox>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            label="Professional Summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Write a compelling professional summary that highlights your key achievements, skills, and career objectives..."
                            helperText="Tip: Keep your summary concise, focused, and tailored to your target role"
                          />
                        </Grid>
                      </Grid>
                    </ItemBox>
                  )}

                  {sectionType === 'experience' && (
                    <>
                      {experience.map((exp, expIndex) => (
                        <ItemBox key={expIndex}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Company"
                                value={exp.company}
                                onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Position"
                                value={exp.position}
                                onChange={(e) => updateExperience(expIndex, 'position', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Start Date"
                                value={exp.start_date}
                                onChange={(e) => updateExperience(expIndex, 'start_date', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                  fullWidth
                                  label="End Date"
                                  value={exp.end_date}
                                  disabled={exp.current}
                                  onChange={(e) => updateExperience(expIndex, 'end_date', e.target.value)}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={exp.current}
                                      onChange={(e) => updateExperience(expIndex, 'current', e.target.checked)}
                                    />
                                  }
                                  label="Current"
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                value={exp.description}
                                onChange={(e) => updateExperience(expIndex, 'description', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <ActionButton
                              variant="outlined"
                              color="error"
                              onClick={() => removeExperience(expIndex)}
                            >
                              Remove
                            </ActionButton>
                          </Box>
                        </ItemBox>
                      ))}
                      <Box sx={{ mt: 2 }}>
                        <ActionButton
                          variant="contained"
                          onClick={addExperience}
                        >
                          Add Experience
                        </ActionButton>
                      </Box>
                    </>
                  )}

                  {sectionType === 'education' && (
                    <>
                      {education.map((edu, eduIndex) => (
                        <ItemBox key={eduIndex}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="School"
                                value={edu.school}
                                onChange={(e) => updateEducation(eduIndex, 'school', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Degree"
                                value={edu.degree}
                                onChange={(e) => updateEducation(eduIndex, 'degree', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Field of Study"
                                value={edu.field}
                                onChange={(e) => updateEducation(eduIndex, 'field', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Start Year"
                                value={edu.start_year}
                                onChange={(e) => updateEducation(eduIndex, 'start_year', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                  fullWidth
                                  label="End Year"
                                  value={edu.end_year}
                                  disabled={edu.current}
                                  onChange={(e) => updateEducation(eduIndex, 'end_year', e.target.value)}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={edu.current}
                                      onChange={(e) => updateEducation(eduIndex, 'current', e.target.checked)}
                                    />
                                  }
                                  label="Current"
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={edu.description}
                                onChange={(e) => updateEducation(eduIndex, 'description', e.target.value)}
                              />
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <ActionButton
                              variant="outlined"
                              color="error"
                              onClick={() => removeEducation(eduIndex)}
                            >
                              Remove
                            </ActionButton>
                          </Box>
                        </ItemBox>
                      ))}
                      <Box sx={{ mt: 2 }}>
                        <ActionButton
                          variant="contained"
                          onClick={addEducation}
                        >
                          Add Education
                        </ActionButton>
                      </Box>
                    </>
                  )}

                  {sectionType === 'skills' && (
                    <>
                      {skills.map((skill, skillIndex) => (
                        <ItemBox key={skillIndex}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Skill"
                                value={skill}
                                onChange={(e) => {
                                  const newSkills = [...skills];
                                  newSkills[skillIndex] = e.target.value;
                                  setSkills(newSkills);
                                }}
                              />
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <ActionButton
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                const newSkills = skills.filter((_, i) => i !== skillIndex);
                                setSkills(newSkills);
                              }}
                            >
                              Remove
                            </ActionButton>
                          </Box>
                        </ItemBox>
                      ))}
                      <Box sx={{ mt: 2 }}>
                        <ActionButton
                          variant="contained"
                          onClick={() => setSkills([...skills, ''])}
                        >
                          Add Skill
                        </ActionButton>
                      </Box>
                    </>
                  )}

                  {sectionType === 'projects' && (
                    <>
                      {projects.map((project, projectIndex) => (
                        <ItemBox key={projectIndex}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Project Title"
                                value={project.title}
                                onChange={(e) => updateProject(projectIndex, 'title', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                label="Start Date"
                                value={project.start_date}
                                onChange={(e) => updateProject(projectIndex, 'start_date', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                  fullWidth
                                  label="End Date"
                                  value={project.end_date}
                                  disabled={project.current}
                                  onChange={(e) => updateProject(projectIndex, 'end_date', e.target.value)}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={project.current}
                                      onChange={(e) => updateProject(projectIndex, 'current', e.target.checked)}
                                    />
                                  }
                                  label="Current"
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                value={project.description}
                                onChange={(e) => updateProject(projectIndex, 'description', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Skills (comma separated)"
                                value={project.skills ? project.skills.join(', ') : ''}
                                onChange={(e) => updateProjectSkills(projectIndex, e.target.value)}
                                helperText="Enter skills separated by commas"
                              />
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <ActionButton
                              variant="outlined"
                              color="error"
                              onClick={() => removeProject(projectIndex)}
                            >
                              Remove
                            </ActionButton>
                          </Box>
                        </ItemBox>
                      ))}
                      <Box sx={{ mt: 2 }}>
                        <ActionButton
                          variant="contained"
                          onClick={addProject}
                        >
                          Add Project
                        </ActionButton>
                      </Box>
                    </>
                  )}

                  {sectionType === 'custom' && (
                    <>
                      {sections.filter(section => 
                        !['personal', 'experience', 'education', 'skills'].includes(section.id)
                      ).map((section, sectionIndex) => (
                        <ItemBox key={section.id}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Section Title"
                                value={section.title}
                                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                              />
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <ActionButton
                              variant="outlined"
                              color="error"
                              onClick={() => removeSection(section.id)}
                            >
                              Remove
                            </ActionButton>
                          </Box>
                          {section.bullets.map((bullet, bulletIndex) => (
                            <ItemBox key={bulletIndex}>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Bullet Point"
                                    value={bullet}
                                    onChange={(e) => updateBulletPoint(section.id, bulletIndex, e.target.value)}
                                  />
                                </Grid>
                              </Grid>
                              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <ActionButton
                                  variant="outlined"
                                  color="error"
                                  onClick={() => removeBulletPoint(section.id, bulletIndex)}
                                >
                                  Remove
                                </ActionButton>
                              </Box>
                            </ItemBox>
                          ))}
                          <Box sx={{ mt: 2 }}>
                            <ActionButton
                              variant="contained"
                              onClick={() => addBulletPoint(section.id)}
                            >
                              Add Bullet Point
                            </ActionButton>
                          </Box>
                        </ItemBox>
                      ))}
                      <Box sx={{ mt: 2 }}>
                        <ActionButton
                          variant="contained"
                          onClick={addSection}
                        >
                          Add Custom Section
                        </ActionButton>
                      </Box>
                    </>
                  )}
                </ItemBox>
              )}
            </DraggableSection>
          ))}
        </DndProvider>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <ActionButton
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            sx={{ minWidth: '200px' }}
          >
            Save Changes
          </ActionButton>
        </Box>
      </EditContainer>
    </Box>
  );
};

export default ResumeEditor; 