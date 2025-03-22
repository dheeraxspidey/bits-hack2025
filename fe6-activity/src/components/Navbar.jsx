import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useMediaQuery, 
  useTheme, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider,
  Container
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Description as ResumeIcon, 
  Description as DescriptionIcon,
  Link as IntegrationsIcon, 
  AccountCircle, 
  ExitToApp as LogoutIcon,
  Assignment as ActivitiesIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Profile from './Profile';
import SetAPIKey from './SetAPIKey';

const Navbar = ({ logout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAPIKeyDialogOpen, setAPIKeyDialogOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleOpenProfile = () => {
    handleProfileMenuClose();
    setIsProfileOpen(true);
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Resume', icon: <ResumeIcon />, path: '/resume-builder' },
    { text: 'Cover Letter', icon: <DescriptionIcon />, path: '/cover-letter' }
  ];
  
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          ResumeHub
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  
  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', color: 'text.primary', borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: '64px' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: isMobile ? 1 : 0, 
                fontWeight: 'bold', 
                color: theme.palette.primary.main,
                cursor: 'pointer',
                mr: 4
              }}
              onClick={() => navigate('/dashboard')}
            >
              ResumeHub
            </Typography>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', flexGrow: 1 }}>
                {menuItems.map((item) => (
                  <Button 
                    key={item.text}
                    color="inherit"
                    onClick={() => handleNavigate(item.path)}
                    sx={{ 
                      mx: 1,
                      py: 2,
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                      borderBottom: location.pathname === item.path ? `2px solid ${theme.palette.primary.main}` : 'none',
                      borderRadius: 0,
                      color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        borderBottom: `2px solid ${theme.palette.primary.light}`,
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { setIsProfileOpen(true); handleProfileMenuClose(); }}>
          <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { setAPIKeyDialogOpen(true); handleProfileMenuClose(); }}>
          <ListItemIcon><VpnKeyIcon fontSize="small" /></ListItemIcon>
          Set API Key
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Profile Dialog */}
      <Profile 
        open={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      <SetAPIKey 
        open={isAPIKeyDialogOpen} 
        onClose={() => {
          setAPIKeyDialogOpen(false);
        }}
      />
    </>
  );
};

export default Navbar; 