import React, { useContext, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, Divider, CircularProgress } from '@mui/material';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';

// Function to check if the server is accessible directly
const checkDirectDataAccess = async () => {
  try {
    const response = await fetch('http://localhost:5003/data/assessments', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.success && data.data && data.data.length > 0;
  } catch (err) {
    console.error('Error checking direct data access:', err);
    return false;
  }
};

const drawerWidth = 240;

const Layout = () => {
  const { doctor } = useContext(AuthContext);
  const location = useLocation();
  const [directDataAvailable, setDirectDataAvailable] = useState(null);
  
  // Check for direct data access
  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await checkDirectDataAccess();
      setDirectDataAvailable(hasAccess);
    };
    
    checkAccess();
  }, []);
  
  // Extract the page title from the current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/patients')) return 'Patients';
    if (path.includes('/assessments')) return 'Assessments';
    if (path.includes('/booking')) return 'Booking';
    if (path.includes('/profile')) return 'Profile';
    return 'Clinic Dashboard';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#2e7d32' // Green color for the app bar
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '50px',
              padding: '4px 12px'
            }}
          >
            {directDataAvailable !== null ? (
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: directDataAvailable ? 'success.main' : 'error.main',
                  mr: 1
                }} 
              />
            ) : (
              <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />
            )}
            <Typography variant="body2" color="inherit">
              {doctor?.name || 'Guest'}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            Clinic Dashboard
          </Typography>
        </Toolbar>
        <Divider />
        <Sidebar />
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 