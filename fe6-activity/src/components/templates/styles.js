import { styled } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';

// Base Resume Container
export const ResumeContainer = styled(Paper)(({ theme }) => ({
  width: '8.5in',
  minHeight: '11in',
  backgroundColor: 'white',
  position: 'relative',
  fontSize: '0.9rem',
  padding: '0.5in',
  margin: '0 auto',
  boxShadow: 'none',
  '@media print': {
    width: '8.5in !important',
    height: '11in !important',
    margin: '0 !important',
    padding: '0.5in !important',
    overflow: 'hidden !important',
    boxShadow: 'none !important',
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
    position: 'relative',
    '& > div': {
      overflow: 'hidden !important',
      height: '10in !important'
    },
    '& *': {
      overflow: 'hidden !important'
    },
    '@page': {
      size: 'letter',
      margin: 0
    }
  }
}));

// Section Container
export const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  pageBreakInside: 'avoid',
  '& .MuiTypography-body2': {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    marginBottom: theme.spacing(0.25)
  },
  '& .MuiTypography-subtitle2': {
    fontSize: '0.8rem',
    marginBottom: theme.spacing(0.25)
  },
  '& .MuiTypography-caption': {
    fontSize: '0.7rem'
  },
  '@media print': {
    pageBreakInside: 'avoid',
    marginBottom: '12px !important',
    '& *': {
      pageBreakInside: 'avoid'
    }
  },
  '&:last-child': {
    marginBottom: 0
  }
}));

// Modern Template Styles
export const ModernSectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '1.2rem',
  marginBottom: theme.spacing(1),
  paddingBottom: theme.spacing(0.5),
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  pageBreakAfter: 'avoid',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

export const ModernHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  '& h4': {
    fontSize: '1.5rem',
    fontWeight: 600,
    letterSpacing: '1px',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    }
  },
  '& .MuiTypography-body1': {
    fontSize: '0.9rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.8rem',
    }
  },
  '& .MuiTypography-body2': {
    fontSize: '0.8rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.7rem',
    }
  }
}));

// Classic Template Styles
export const ClassicSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: theme.palette.text.primary,
  pageBreakAfter: 'avoid',
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(0.25),
}));

export const ClassicHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  textAlign: 'center',
  '& h3': {
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '1px',
    marginBottom: theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    }
  },
  '& .MuiTypography-body1': {
    fontSize: '0.85rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
    }
  }
}));

// Shared Components
export const ExperienceItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0,
  },
  '& .MuiTypography-h6': {
    fontSize: '0.95rem',
    marginBottom: '0.2rem',
  },
  '& .MuiTypography-subtitle1': {
    fontSize: '0.9rem',
    marginBottom: '0.2rem',
    fontWeight: 600,
  },
  '& .MuiTypography-subtitle2': {
    fontSize: '0.85rem',
    marginBottom: '0.2rem',
  },
  '& .MuiTypography-body2': {
    fontSize: '0.8rem',
    lineHeight: 1.4,
  }
}));

export const SkillsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.75),
  '& .MuiChip-root': {
    height: '24px',
    fontSize: '0.8rem',
    '& .MuiChip-label': {
      padding: '0 8px',
    }
  }
}));

export const ProjectItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0
  }
}));

export const ProfileImageContainer = styled(Box)(({ theme }) => ({
  '@media print': {
    '& .MuiAvatar-root': {
      printColorAdjust: 'exact',
      WebkitPrintColorAdjust: 'exact',
      borderRadius: '50% !important',
      border: '2px solid #fff !important',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15) !important',
      width: '90px !important',
      height: '90px !important',
      overflow: 'hidden !important',
      '& img': {
        borderRadius: '50% !important',
        objectFit: 'cover !important'
      }
    }
  }
}));

// Content Container
export const ContentContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  '@media print': {
    width: '100% !important',
    height: '100% !important',
    overflow: 'visible !important',
    transform: 'none !important',
    position: 'relative',
    '& > div': {
      transform: 'none !important',
      height: 'auto !important',
      overflow: 'visible !important'
    }
  }
}));

// Print Styles
export const PrintStyles = {
  '@media print': {
    transform: 'none !important',
    height: '11in !important',
    width: '8.5in !important',
    overflow: 'hidden !important',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    backgroundColor: 'white !important',
    boxShadow: 'none !important',
    margin: '0 !important',
    padding: '0.5in !important',
    '& *': {
      overflow: 'hidden !important',
      transform: 'none !important'
    },
    '& .MuiAvatar-root': {
      printColorAdjust: 'exact !important',
      WebkitPrintColorAdjust: 'exact !important',
      borderRadius: '50% !important',
      width: '90px !important',
      height: '90px !important'
    },
    '& .MuiDivider-root': {
      margin: '4px 0 !important',
    },
    '& .MuiTypography-root': {
      lineHeight: '1.2 !important',
      marginBottom: '3px !important'
    },
    '& .MuiBox-root': {
      marginBottom: '4px !important',
    },
    '& .MuiChip-root': {
      margin: '1px !important',
    },
    '& section': {
      pageBreakInside: 'avoid !important',
      breakInside: 'avoid !important'
    }
  }
};

// ATS-specific print styles
export const ATSPrintStyles = {
  '@media print': {
    ...PrintStyles['@media print'],
    '& *': {
      fontFamily: 'Times New Roman, serif !important',
      lineHeight: '1.2 !important',
    },
    '& .MuiTypography-root': {
      color: 'black !important',
    },
    '& .description': {
      marginLeft: '16px !important',
    }
  }
}; 