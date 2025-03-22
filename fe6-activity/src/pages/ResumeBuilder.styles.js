import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, Button, Select, MenuItem, Chip, Alert } from '@mui/material';

export const QuotaErrorAlert = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #fff6f6 0%, #ffe9e9 100%)',
  border: '1px solid #ffcccc',
  boxShadow: '0 4px 16px rgba(255, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '6px',
    height: '100%',
    background: 'linear-gradient(to bottom, #ff5252, #ff1744)',
  },
  '& .error-header': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  '& .error-icon': {
    fontSize: '2.5rem',
    color: theme.palette.error.main,
  },
  '& .error-title': {
    fontWeight: 700,
    color: theme.palette.error.main,
  },
  '& .error-message': {
    fontSize: '1rem',
    color: theme.palette.error.dark,
    paddingLeft: theme.spacing(6),
  },
  '& .error-actions': {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
}));

export const Container = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1)
  }
}));

export const ContentWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  width: '100%',
  margin: '0 auto',
  padding: theme.spacing(0, 4),
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  [theme.breakpoints.down('lg')]: {
    maxWidth: '1400px',
    padding: theme.spacing(0, 3),
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '1200px',
    padding: theme.spacing(0, 2),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 1)
  }
}));

export const Title = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  marginBottom: theme.spacing(3),
  fontWeight: 700,
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textAlign: 'center',
  letterSpacing: '0.5px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.8rem',
    marginBottom: theme.spacing(2)
  }
}));

export const StyledStepper = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '15px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  '& .MuiStepLabel-label': {
    fontSize: '1.1rem',
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem'
    }
  },
  '& .MuiStepIcon-root': {
    color: theme.palette.primary.main,
    '&.Mui-active': {
      color: theme.palette.primary.dark
    },
    '&.Mui-completed': {
      color: '#4CAF50'
    }
  }
}));

export const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  minHeight: '60vh',
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  transition: 'transform 0.2s ease-in-out',
  width: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
  '& .resume-preview': {
    display: 'flex',
    gap: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    }
  },
  '& .edit-section': {
    flex: '0 0 400px',
    [theme.breakpoints.down('md')]: {
      flex: '1 1 auto',
      width: '100%',
      marginTop: theme.spacing(3)
    }
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    minHeight: '50vh',
  }
}));

export const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: '15px',
  background: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1)
  }
}));

export const NavigationButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    width: '100%'
  }
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  background: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 1)'
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%'
  }
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: '120px',
  borderRadius: '10px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
  boxShadow: '0 3px 15px rgba(33, 150, 243, 0.3)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 20px rgba(33, 150, 243, 0.4)',
    background: 'linear-gradient(45deg, #1976D2 30%, #00B4E5 90%)'
  },
  transition: 'all 0.3s ease'
}));

export const ResumePreviewContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  overflow: 'auto',
  maxHeight: '70vh',
  padding: '20px',
  background: 'transparent',
  position: 'relative',
  transition: 'width 0.3s ease-in-out',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '6px',
    margin: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    borderRadius: '6px',
    border: '3px solid rgba(255, 255, 255, 0.95)',
    '&:hover': {
      background: 'linear-gradient(45deg, #1976D2 30%, #00B4E5 90%)',
    },
  },
  '&::-webkit-scrollbar-corner': {
    background: 'transparent',
  },
  scrollbarWidth: 'thin',
  scrollbarColor: '#2196F3 rgba(0, 0, 0, 0.05)',
  '@media print': {
    overflow: 'visible !important',
    height: 'auto !important',
    maxHeight: 'none !important',
    padding: '0 !important',
    background: 'none',
    '& *': {
      overflow: 'visible !important',
      transform: 'none !important'
    }
  }
}));

export const PreviewPaper = styled(Paper)(({ theme }) => ({
  width: '8.5in',
  minHeight: '11in',
  padding: '0.5in',
  backgroundColor: 'white',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  margin: '0 auto',
  transformOrigin: 'top center',
  '@media print': {
    margin: '0 !important',
    padding: '0.5in !important',
    boxShadow: 'none !important',
    border: 'none !important',
    transform: 'none !important',
    overflow: 'visible !important',
    '& *': {
      overflow: 'visible !important',
      transform: 'none !important'
    }
  },
  '@media (max-width: 8.5in)': {
    width: '100%',
    height: 'auto',
    transform: 'scale(0.95)',
  }
}));

export const EditContainer = styled(Box)(({ theme }) => ({
  maxHeight: '70vh',
  overflowY: 'auto',
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
  transition: 'width 0.3s ease-in-out',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    borderRadius: '6px',
    border: '3px solid rgba(255, 255, 255, 0.7)',
  },
  [theme.breakpoints.down('md')]: {
    maxHeight: '50vh',
  }
}));

export const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  borderRadius: '15px',
  background: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  '& .section-header': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(2)
  },
  '& .section-buttons': {
    display: 'flex',
    gap: theme.spacing(1),
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 1)'
  },
  [theme.breakpoints.up('md')]: {
    '& .MuiIconButton-root': {
      opacity: 0.7,
      transition: 'all 0.2s ease',
    },
    '&:hover .MuiIconButton-root': {
      opacity: 1,
    }
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    '& .MuiTypography-h6': {
      fontSize: '1.1rem',
      fontWeight: 600
    }
  }
}));

export const ItemBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2.5),
  borderRadius: '15px',
  background: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  transition: 'all 0.3s ease',
  '& .item-header': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  '& .MuiGrid-container': {
    gap: theme.spacing(2)
  },
  '& .MuiTextField-root': {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      background: 'rgba(255, 255, 255, 0.9)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 1)'
      }
    }
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 1)'
  },
  '& .MuiMenu-paper': {
    borderRadius: '12px !important',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1) !important',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    '& .MuiGrid-container': {
      gap: theme.spacing(1.5)
    }
  }
}));

export const IconButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  '& .MuiIconButton-root': {
    padding: '8px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
    },
    '& svg': {
      fontSize: '1.4rem',
      color: theme.palette.primary.main
    }
  }
}));

export const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-root': {
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transition: theme.transitions.create(['background-color', 'box-shadow']),
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)',
    },
  },
}));

export const ActivityMenuItem = styled(MenuItem)(({ theme }) => ({
  '&.MuiMenuItem-root': {
    padding: theme.spacing(1.5, 2),
    '&:hover': {
      backgroundColor: 'rgba(33, 150, 243, 0.08)',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(33, 150, 243, 0.12)',
    },
  },
}));

export const ActivityChip = styled(Chip)(({ theme }) => ({
  transition: 'all 0.2s ease',
  borderRadius: '8px',
  fontWeight: 500,
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

export const ActivityCard = styled(SectionPaper)(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `2px solid ${selected ? theme.palette.primary.main : 'transparent'}`,
  background: selected 
    ? 'rgba(33, 150, 243, 0.05)' 
    : 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(33, 150, 243, 0.15)',
    borderColor: theme.palette.primary.light
  },
  '&:active': {
    transform: 'translateY(-2px)'
  }
})); 