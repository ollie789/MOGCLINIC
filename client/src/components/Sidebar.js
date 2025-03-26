import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Event as CalendarIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
    { text: 'Assessments', icon: <AssessmentIcon />, path: '/assessments' },
    { text: 'Booking', icon: <CalendarIcon />, path: '/booking' }
  ];

  // Add a direct assessments link when in development
  if (process.env.NODE_ENV === 'development') {
    menuItems.push({ 
      text: 'Direct Assessments', 
      icon: <AssessmentIcon color="success" />, 
      path: '/direct-assessments',
      highlight: true 
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            disablePadding
            selected={location.pathname === item.path}
          >
            <ListItemButton 
              component={Link} 
              to={item.path}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                },
                ...(item.highlight && {
                  borderLeft: '4px solid #4caf50',
                  paddingLeft: 1
                })
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: item.highlight ? 'bold' : 'normal',
                  color: item.highlight ? 'success.main' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box p={2} sx={{ marginTop: 'auto' }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </>
  );
};

export default Sidebar; 