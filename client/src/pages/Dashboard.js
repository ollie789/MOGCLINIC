import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../utils/api';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Function to attempt multiple URL patterns for the server
const attemptDataFetch = async () => {
  // List of potential server URLs to try
  const serverUrls = [
    `${window.location.protocol}//${window.location.hostname}:5003`,
    `${window.location.protocol}//${window.location.hostname}:5002`,
    'http://localhost:5003',
    'http://localhost:5002'
  ];
  
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
        },
        credentials: 'omit' // Don't send credentials for cross-origin requests
      });
      
      if (!response.ok) {
        console.log(`Server responded with status: ${response.status} for ${baseUrl}`);
        continue; // Try next URL pattern
      }
      
      const data = await response.json();
      console.log(`Success! Data received from ${baseUrl}:`, data);
      
      if (data.success && data.data && data.data.length > 0) {
        return { baseUrl, data };
      }
    } catch (err) {
      console.error(`Error fetching from ${baseUrl}:`, err);
      lastError = err;
    }
  }
  
  throw lastError || new Error('Failed to fetch data from all possible server URLs');
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directData, setDirectData] = useState(null);
  const [serverBaseUrl, setServerBaseUrl] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        
        // Try the multi-URL approach
        const { baseUrl, data } = await attemptDataFetch();
        setServerBaseUrl(baseUrl);
        setDirectData(data);
        
        // Process the data
        const processedStats = {
          totalAssessments: data.count || 0,
          recentAssessments: data.data.filter(a => {
            const date = new Date(a.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo;
          }).length,
          uniquePatientCount: [...new Set(data.data.map(a => a.userInfo?.email))].length,
          // Calculate average pain level if available
          avgPainLevel: data.data.some(a => a.painLevel) 
            ? (data.data.reduce((sum, a) => sum + (a.painLevel || 0), 0) / 
               data.data.filter(a => a.painLevel).length).toFixed(1)
            : 'N/A',
          // Count medical conditions
          medicalConditions: {
            herniatedDisc: data.data.filter(a => a.medicalConditions?.herniatedDisc).length,
            spinalStenosis: data.data.filter(a => a.medicalConditions?.spinalStenosis).length,
            spondylolisthesis: data.data.filter(a => a.medicalConditions?.spondylolisthesis).length,
            scoliosis: data.data.filter(a => a.medicalConditions?.scoliosis).length
          }
        };
        
        setStats(processedStats);
        
        // Set recent assessments
        setRecentAssessments(data.data.slice(0, 5));
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data for medical conditions
  const prepareMedicalConditionsData = () => {
    if (!stats || !stats.medicalConditions) return null;
    
    const { herniatedDisc, spinalStenosis, spondylolisthesis, scoliosis } = stats.medicalConditions;
    
    return {
      labels: ['Herniated Disc', 'Spinal Stenosis', 'Spondylolisthesis', 'Scoliosis'],
      datasets: [
        {
          data: [herniatedDisc || 0, spinalStenosis || 0, spondylolisthesis || 0, scoliosis || 0],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    borderRadius: '50%', 
                    width: 40, 
                    height: 40,
                    mr: 2
                  }}
                >
                  <PeopleIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">
                  Patients
                </Typography>
              </Box>
              <Typography variant="h3" component="div" align="center">
                {stats?.uniquePatientCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                Unique patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  sx={{ 
                    bgcolor: 'secondary.light', 
                    borderRadius: '50%', 
                    width: 40, 
                    height: 40,
                    mr: 2
                  }}
                >
                  <AssessmentIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">
                  Assessments
                </Typography>
              </Box>
              <Typography variant="h3" component="div" align="center">
                {stats?.totalAssessments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                Total assessments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  sx={{ 
                    bgcolor: 'success.light', 
                    borderRadius: '50%', 
                    width: 40, 
                    height: 40,
                    mr: 2
                  }}
                >
                  <CalendarIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">
                  Recent
                </Typography>
              </Box>
              <Typography variant="h3" component="div" align="center">
                {stats?.recentAssessments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                Last 7 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card" sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  sx={{ 
                    bgcolor: 'warning.light', 
                    borderRadius: '50%', 
                    width: 40, 
                    height: 40,
                    mr: 2
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" color="text.secondary">
                  Avg. Pain
                </Typography>
              </Box>
              <Typography variant="h3" component="div" align="center">
                {stats?.avgPainLevel || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                Average pain level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts and Recent Assessments */}
      <Grid container spacing={3}>
        {/* Medical Conditions Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Medical Conditions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              {prepareMedicalConditionsData() ? (
                <Pie data={prepareMedicalConditionsData()} options={{ maintainAspectRatio: false }} />
              ) : (
                <Typography color="text.secondary">No data available</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Assessments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Assessments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentAssessments.length > 0 ? (
              <Box>
                {recentAssessments.map((assessment) => (
                  <Box key={assessment._id} mb={2} pb={2} borderBottom="1px solid #eee">
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant="subtitle1">
                          {assessment.userInfo.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assessment.userInfo.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} display="flex" justifyContent="flex-end" alignItems="center">
                        <Button 
                          component={Link} 
                          to={`/assessments/${assessment._id}`}
                          variant="outlined" 
                          size="small"
                        >
                          View Details
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button 
                    component={Link} 
                    to="/assessments" 
                    variant="contained" 
                    color="primary"
                  >
                    View All Assessments
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary" align="center">
                No recent assessments
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 