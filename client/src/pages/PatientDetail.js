import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Tabs,
  Tab,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '../utils/api';

// Tab Panel component for displaying tab content
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const PatientDetail = () => {
  const { id } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/patients/${id}`);
      setPatientData(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to load patient data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!patientData || !patientData.patient) {
    return (
      <Box m={3}>
        <Alert severity="warning">Patient not found</Alert>
      </Box>
    );
  }

  const { patient, assessments } = patientData;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Patient Details
        </Typography>
        <Button 
          component={Link} 
          to="/patients"
          variant="outlined"
        >
          Back to Patients
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box p={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    borderRadius: '50%', 
                    width: 60, 
                    height: 60,
                    mr: 2,
                    fontSize: '1.5rem'
                  }}
                >
                  {patient.name.charAt(0).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="h5">
                    {patient.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Patient ID: {patient._id}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
                <Box display="flex" alignItems="center" mb={1}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>
                    {patient.email}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center">
                  <TodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>
                    Registered: {formatDate(patient.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="patient tabs"
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Assessment History" />
            <Tab label="Personal Information" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {assessments && assessments.length > 0 ? (
            <List>
              {assessments.map((assessment) => (
                <Paper 
                  key={assessment._id} 
                  elevation={1} 
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          Assessment from {formatDate(assessment.createdAt)}
                        </Typography>
                      }
                      secondary={
                        <Box mt={1}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatTime(assessment.createdAt)}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" mb={1}>
                            Pain Level: <strong>{assessment.painLevel || 'N/A'}</strong>
                          </Typography>
                          
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
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        component={Link}
                        to={`/assessments/${assessment._id}`}
                        startIcon={<VisibilityIcon />}
                        variant="contained"
                        color="primary"
                      >
                        View Details
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No assessments found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This patient has not submitted any pain assessments yet.
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Personal Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {patient.name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {patient.email}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography variant="body1">
                      {patient._id}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Account Created
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(patient.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Assessment Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Assessments
                    </Typography>
                    <Typography variant="body1">
                      {assessments.length}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Latest Assessment
                    </Typography>
                    <Typography variant="body1">
                      {assessments.length > 0 
                        ? formatDate(assessments[0].createdAt) 
                        : 'No assessments yet'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Medical Conditions
                    </Typography>
                    {assessments.length > 0 ? (
                      <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {assessments[0].medicalConditions?.herniatedDisc && (
                          <Chip label="Herniated Disc" size="small" color="primary" variant="outlined" />
                        )}
                        {assessments[0].medicalConditions?.spinalStenosis && (
                          <Chip label="Spinal Stenosis" size="small" color="primary" variant="outlined" />
                        )}
                        {assessments[0].medicalConditions?.spondylolisthesis && (
                          <Chip label="Spondylolisthesis" size="small" color="primary" variant="outlined" />
                        )}
                        {assessments[0].medicalConditions?.scoliosis && (
                          <Chip label="Scoliosis" size="small" color="primary" variant="outlined" />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body1">
                        No data available
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PatientDetail; 