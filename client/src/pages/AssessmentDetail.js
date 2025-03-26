import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  Today as TodayIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import api from '../utils/api';

const AssessmentDetail = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/assessments/${id}`);
      setAssessment(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError('Failed to load assessment data. Please try again later.');
    } finally {
      setLoading(false);
    }
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

  if (!assessment) {
    return (
      <Box m={3}>
        <Alert severity="warning">Assessment not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Assessment Details
        </Typography>
        <Button 
          component={Link} 
          to="/assessments"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Back to Assessments
        </Button>
      </Box>

      {/* Assessment Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center">
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                sx={{ 
                  bgcolor: 'primary.light', 
                  borderRadius: '50%', 
                  width: 50, 
                  height: 50,
                  mr: 2
                }}
              >
                <PersonIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5">
                  {assessment.userInfo?.name || 'Unknown Patient'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {assessment.userInfo?.email || 'No email provided'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <TodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>
                  {formatDate(assessment.createdAt)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>
                  {formatTime(assessment.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Assessment Content */}
      <Grid container spacing={3}>
        {/* Pain Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pain Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Pain Level
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: (() => {
                          const painLevel = assessment.painLevel || 0;
                          if (painLevel >= 7) return 'error.main';
                          if (painLevel >= 4) return 'warning.main';
                          return 'success.main';
                        })(),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <Typography variant="h5" color="white">
                        {assessment.painLevel || 0}
                      </Typography>
                    </Box>
                    <Typography>
                      {(() => {
                        const painLevel = assessment.painLevel || 0;
                        if (painLevel >= 7) return 'Severe';
                        if (painLevel >= 4) return 'Moderate';
                        return 'Mild';
                      })()}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Pain Duration
                  </Typography>
                  <Typography variant="body1" mt={1}>
                    {assessment.painDuration || 'Not specified'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pain Description
                  </Typography>
                  <Typography variant="body1">
                    {assessment.painDescription || 'No description provided'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Medical Conditions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medical Conditions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" flexDirection="column" gap={2}>
                {assessment.medicalConditions ? (
                  <>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {assessment.medicalConditions.herniatedDisc && (
                        <Chip label="Herniated Disc" color="primary" />
                      )}
                      {assessment.medicalConditions.spinalStenosis && (
                        <Chip label="Spinal Stenosis" color="primary" />
                      )}
                      {assessment.medicalConditions.spondylolisthesis && (
                        <Chip label="Spondylolisthesis" color="primary" />
                      )}
                      {assessment.medicalConditions.scoliosis && (
                        <Chip label="Scoliosis" color="primary" />
                      )}
                      {!assessment.medicalConditions.herniatedDisc && 
                       !assessment.medicalConditions.spinalStenosis && 
                       !assessment.medicalConditions.spondylolisthesis && 
                       !assessment.medicalConditions.scoliosis && (
                        <Typography>No medical conditions reported</Typography>
                      )}
                    </Box>
                    
                    {assessment.medicalConditions.otherConditions && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Other Conditions
                        </Typography>
                        <Typography variant="body1">
                          {assessment.medicalConditions.otherConditions}
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography>No medical conditions data available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Pain Points/Locations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pain Locations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {assessment.painLocations && assessment.painLocations.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Location</TableCell>
                        <TableCell>Side</TableCell>
                        <TableCell>Intensity</TableCell>
                        <TableCell>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assessment.painLocations.map((location, index) => (
                        <TableRow key={index}>
                          <TableCell>{location.area || 'Unknown'}</TableCell>
                          <TableCell>{location.side || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={location.intensity || 'Unknown'} 
                              color={
                                location.intensity === 'High' ? 'error' :
                                location.intensity === 'Medium' ? 'warning' : 'success'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{location.type || 'Not specified'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={3}>
                  <Typography color="text.secondary">
                    No specific pain locations recorded
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Treatment History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Treatment History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {assessment.treatments ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Medication
                      </Typography>
                      <Typography variant="body1">
                        {assessment.treatments.medication ? 'Yes' : 'No'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Physical Therapy
                      </Typography>
                      <Typography variant="body1">
                        {assessment.treatments.physicalTherapy ? 'Yes' : 'No'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Surgery
                      </Typography>
                      <Typography variant="body1">
                        {assessment.treatments.surgery ? 'Yes' : 'No'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Alternative Therapy
                      </Typography>
                      <Typography variant="body1">
                        {assessment.treatments.alternativeTherapy ? 'Yes' : 'No'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  {assessment.treatments.notes && (
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Treatment Notes
                        </Typography>
                        <Typography variant="body1">
                          {assessment.treatments.notes}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Box textAlign="center" py={3}>
                  <Typography color="text.secondary">
                    No treatment history provided
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Doctor Actions */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" gap={2} mt={2}>
            {assessment.userInfo && (
              <Button 
                component={Link}
                to={`/patients/${assessment.userInfo.id}`}
                variant="contained" 
                color="primary"
              >
                View Patient Profile
              </Button>
            )}
            <Button variant="outlined">Download Assessment Report</Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssessmentDetail; 