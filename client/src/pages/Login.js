import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BugReportIcon from '@mui/icons-material/BugReport';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showInvalidCredentials, setShowInvalidCredentials] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isCheckingDebug, setIsCheckingDebug] = useState(false);
  const [directMode, setDirectMode] = useState(false);
  
  const { login, isAuthenticated, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowInvalidCredentials(false);
    
    try {
      await login(email, password);
      // Redirect will happen via the useEffect once isAuthenticated updates
    } catch (err) {
      console.error('Login error:', err);
      setShowInvalidCredentials(true);
    }
  };

  const checkAuthSystem = async () => {
    try {
      setIsCheckingDebug(true);
      
      // Try multiple server URLs
      const serverUrls = [
        `${window.location.protocol}//${window.location.hostname}:5003`,
        `${window.location.protocol}//${window.location.hostname}:5002`,
        'http://localhost:5003',
        'http://localhost:5002'
      ];
      
      let successUrl = null;
      let debugData = null;
      
      // Try each URL
      for (const url of serverUrls) {
        try {
          console.log(`Checking auth system at ${url}/api/auth/debug-check`);
          const response = await fetch(`${url}/api/auth/debug-check`);
          
          if (response.ok) {
            const data = await response.json();
            debugData = data;
            successUrl = url;
            break;
          }
        } catch (err) {
          console.log(`Failed to connect to ${url}:`, err.message);
        }
      }
      
      // Also try database connection
      if (successUrl) {
        try {
          const dbResponse = await fetch(`${successUrl}/debug/db`);
          if (dbResponse.ok) {
            const dbData = await dbResponse.json();
            debugData = { ...debugData, dbInfo: dbData.data };
          }
        } catch (err) {
          console.log('Failed to get DB info:', err.message);
        }
      }
      
      if (debugData) {
        setDebugInfo({
          ...debugData,
          serverUrl: successUrl
        });
      } else {
        setDebugInfo({
          error: "Could not connect to any server endpoint",
          attemptedUrls: serverUrls
        });
      }
    } catch (err) {
      setDebugInfo({
        error: err.message
      });
    } finally {
      setIsCheckingDebug(false);
    }
  };

  const goToDirectMode = () => {
    localStorage.setItem('directMode', 'true');
    navigate('/direct-assessments');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Box
              sx={{
                bgcolor: 'success.main',
                color: 'white',
                borderRadius: '50%',
                p: 1,
                mb: 2
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Box>
            <Typography component="h1" variant="h5">
              Doctor Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access the clinic dashboard to view patient data
            </Typography>
          </Box>

          {showInvalidCredentials && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid Credentials
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          <Box textAlign="center">
            <Typography variant="body2">
              Don't have an account? <Link to="/register">Sign Up</Link>
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box textAlign="center">
            <Button
              variant="outlined"
              color="secondary"
              onClick={goToDirectMode}
              startIcon={<BugReportIcon />}
              sx={{ mb: 2 }}
            >
              Access Data Directly
            </Button>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography color="text.secondary" variant="body2">
                  Debug Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={checkAuthSystem}
                  disabled={isCheckingDebug}
                  sx={{ mb: 2 }}
                >
                  {isCheckingDebug ? <CircularProgress size={20} /> : 'Check Auth System'}
                </Button>
                
                {debugInfo && (
                  <Box 
                    component="pre" 
                    sx={{ 
                      maxHeight: 300, 
                      overflow: 'auto',
                      bgcolor: '#f5f5f5',
                      p: 2,
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}
                  >
                    {JSON.stringify(debugInfo, null, 2)}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 