import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import ProfileDetails from './ProfileDetails';

const base_url = import.meta.env.VITE_API_BASE_URL;
console.log(base_url);

const Profile = ({ open, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const fileInputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]);

  useEffect(() => {
    if (profileData?.profile_image) {
      const byteCharacters = atob(profileData.profile_image);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const newImageUrl = URL.createObjectURL(blob);
      setImageUrl(newImageUrl);

      return () => URL.revokeObjectURL(newImageUrl);
    } else {
      setImageUrl(null);
    }
  }, [profileData?.profile_image]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${base_url}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.profile_image) {
        setProfileData(response.data);
      } else {
        console.warn("Profile data missing profile_image:", response.data);
        setProfileData({...response.data, profile_image: ''});
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${base_url}/api/user/profile`,
        updatedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh profile data after successful update
      await fetchProfileData();
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${base_url}/api/user/profile_image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      if (response.status === 200) {
        // After successful upload, re-fetch profile data.
        fetchProfileData();
      } else {
        setError('Failed to upload image.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image.');
    }
  };

  const handleClose = () => {
    if (isEditing) {
      // If in edit mode, show confirmation dialog
      setShowConfirmDialog(true);
    } else {
      // If not in edit mode, close directly
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setIsEditing(false);
    setShowConfirmDialog(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  const handleProfileIconClick = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return (
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: 'rgba(37, 99, 235, 0.03)',
          py: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Profile</Typography>
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (isEditing) {
    return (
      <>
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="md" 
          fullWidth
          disableEscapeKeyDown
          PaperProps={{
            sx: {
              borderRadius: 2,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: 'rgba(37, 99, 235, 0.03)',
            py: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Profile</Typography>
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 4, py: 4 }}>
            <ProfileDetails
              initialData={profileData}
              onSubmit={handleProfileUpdate}
              onSkip={handleClose}
            />
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={showConfirmDialog}
          onClose={handleCancelClose}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: 'rgba(37, 99, 235, 0.03)',
            py: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Discard Changes?</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Typography>
              You have unsaved changes. Are you sure you want to discard them?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={handleCancelClose} 
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
              onClick={handleConfirmClose} 
              variant="contained" 
              color="error"
              sx={{ 
                borderRadius: 6,
                px: 3,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Discard
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: 'rgba(37, 99, 235, 0.03)',
          py: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Profile</Typography>
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Box
              sx={{
                width: 140,
                height: 140,
                margin: '0 auto',
                mb: 3,
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '50%',
                    zIndex: 1
                  }
                }
              }}
              onClick={handleProfileIconClick}
            >
              <Avatar
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'primary.main',
                  border: '4px solid rgba(37, 99, 235, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
                src={imageUrl}
              >
                {!imageUrl && profileData?.name ? (
                  profileData.name.charAt(0).toUpperCase()
                ) : (
                  !imageUrl && !profileData?.name ? '+' : null
                )}
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              {profileData?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom sx={{ maxWidth: '600px', mx: 'auto', mb: 2 }}>
              {profileData?.bio || 'No bio added yet'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{ 
                mt: 2,
                borderRadius: 6,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(37, 99, 235, 0.04)'
                }
              }}
            >
              Edit Profile
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Contact Information */}
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
              Contact Information
            </Typography>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography>
                  {profileData?.location || 'Not specified'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  GitHub
                </Typography>
                <Typography>
                  {profileData?.github || 'Not linked'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  LinkedIn
                </Typography>
                <Typography>
                  {profileData?.linkedin || 'Not linked'}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Education */}
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
              Education
            </Typography>
            {profileData?.education?.length > 0 ? (
              <Stack spacing={3}>
                {profileData.education.map((edu, index) => (
                  <Box key={index} sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    backgroundColor: 'rgba(37, 99, 235, 0.02)',
                    border: '1px solid rgba(37, 99, 235, 0.08)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {edu.school}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {edu.degree} in {edu.field}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      display: 'inline-block',
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: 'primary.main',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      {edu.start_year} - {edu.current ? 'Present' : edu.end_year}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No education details added</Typography>
            )}
          </Paper>

          {/* Experience */}
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
              Experience
            </Typography>
            {profileData?.experience?.length > 0 ? (
              <Stack spacing={3}>
                {profileData.experience.map((exp, index) => (
                  <Box key={index} sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    backgroundColor: 'rgba(37, 99, 235, 0.02)',
                    border: '1px solid rgba(37, 99, 235, 0.08)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {exp.title} at {exp.company}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      display: 'inline-block',
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: 'primary.main',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      mb: 1
                    }}>
                      {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {exp.description}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No experience details added</Typography>
            )}
          </Paper>

          {/* Skills */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
              Skills
            </Typography>
            {profileData?.skills?.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.skills.map((skill, index) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    sx={{ 
                      borderRadius: 4,
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: 'primary.main',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                      }
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No skills added</Typography>
            )}
          </Paper>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: 'rgba(37, 99, 235, 0.03)',
          py: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Discard Changes?</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography>
            You have unsaved changes. Are you sure you want to discard them?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCancelClose} 
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
            onClick={handleConfirmClose} 
            variant="contained" 
            color="error"
            sx={{ 
              borderRadius: 6,
              px: 3,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Profile; 