import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const AssessmentsList = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState({
    connected: false,
    url: null
  });

  useEffect(() => {
    const fetchDirectData = async () => {
      // List of potential server URLs to try
      const serverUrls = [
        `${window.location.protocol}//${window.location.hostname}:5003`,
        `${window.location.protocol}//${window.location.hostname}:5002`,
        'http://localhost:5003',
        'http://localhost:5002'
      ];
      
      setLoading(true);
      setError(null);
      
      let lastError = null;
      
      // Try each URL pattern
      for (const baseUrl of serverUrls) {
        try {
          console.log(`Attempting to fetch from: ${baseUrl}/data/assessments`);
          const response = await fetch(`${baseUrl}/data/assessments`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          
          if (!response.ok) {
            console.log(`Server responded with status: ${response.status} for ${baseUrl}`);
            continue; // Try next URL pattern
          }
          
          const data = await response.json();
          console.log(`Success! Data received from ${baseUrl}:`, data);
          
          if (data.success && data.data && data.data.length > 0) {
            setServerStatus({
              connected: true,
              url: baseUrl,
              count: data.count || data.data.length
            });
            
            setAssessments(data.data);
            return; // Success! Exit the function
          }
        } catch (err) {
          console.error(`Error fetching from ${baseUrl}:`, err);
          lastError = err;
        }
      }
      
      // If we get here, all attempts failed
      setError(lastError?.message || 'Failed to fetch data from all server URLs');
      setServerStatus({
        connected: false,
        error: lastError?.message
      });
    };

    fetchDirectData()
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Return to login page
  const handleBackToLogin = () => {
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#2e7d32' }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={handleBackToLogin}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Direct Assessments View
          </Typography>
          <Box display="flex" alignItems="center">
            {serverStatus.connected ? (
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Connected" 
                color="success" 
                variant="outlined"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)'
                }} 
              />
            ) : (
              <Chip 
                icon={<ErrorIcon />} 
                label="Disconnected" 
                color="error" 
                variant="outlined"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)'
                }} 
              />
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Direct Database Access
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            This page bypasses authentication and directly accesses the database for troubleshooting.
          </Typography>
        </Box>
        
        {serverStatus.connected && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Connected to server at: {serverStatus.url}
            <br />
            Retrieved {serverStatus.count} assessments
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Medical Conditions</TableCell>
                  <TableCell>Pain Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessments.length > 0 ? (
                  assessments.map((assessment) => (
                    <TableRow key={assessment._id} hover>
                      <TableCell>{assessment.userInfo?.name || 'Unknown'}</TableCell>
                      <TableCell>{assessment.userInfo?.email || 'No email'}</TableCell>
                      <TableCell>{formatDate(assessment.createdAt)}</TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {assessment.medicalConditions?.herniatedDisc && (
                            <Chip label="Herniated Disc" size="small" color="primary" variant="outlined" />
                          )}
                          {assessment.medicalConditions?.spinalStenosis && (
                            <Chip label="Spinal Stenosis" size="small" color="primary" variant="outlined" />
                          )}
                          {assessment.medicalConditions?.spondylolisthesis && (
                            <Chip label="Spondylolisthesis" size="small" color="primary" variant="outlined" />
                          )}
                          {assessment.medicalConditions?.scoliosis && (
                            <Chip label="Scoliosis" size="small" color="primary" variant="outlined" />
                          )}
                          {!assessment.medicalConditions && (
                            <Chip label="None" size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {assessment.painLevel !== undefined ? assessment.painLevel : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" color="text.secondary" py={3}>
                        No assessments available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        <Box mt={4} display="flex" justifyContent="center">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleBackToLogin}
            startIcon={<ArrowBackIcon />}
          >
            Back to Login
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default AssessmentsList; 