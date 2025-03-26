import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Pagination,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import api from '../utils/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchMode, setSearchMode] = useState(false);

  const patientsPerPage = 8;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/patients?page=${page}&limit=${patientsPerPage}`);
        setPatients(res.data.patients);
        setTotalPages(res.data.pagination.pages);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!searchMode) {
      fetchPatients();
    }
  }, [page, searchMode]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchMode(false);
      return;
    }

    try {
      setLoading(true);
      setSearchMode(true);
      
      const res = await api.get(`/api/patients/search?query=${searchQuery}`);
      setFilteredPatients(res.data);
      setError(null);
    } catch (err) {
      console.error('Error searching patients:', err);
      setError('Failed to search patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      setSearchMode(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const displayedPatients = searchMode ? filteredPatients : patients;

  if (loading && !displayedPatients.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Patients
        </Typography>
        
        <TextField
          placeholder="Search patients..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {searchMode && (
        <Box mb={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1">
              {filteredPatients.length} {filteredPatients.length === 1 ? 'result' : 'results'} found for "{searchQuery}"
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => {
                setSearchQuery('');
                setSearchMode(false);
              }}
            >
              Clear search
            </Button>
          </Paper>
        </Box>
      )}

      {displayedPatients.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {displayedPatients.map((patient) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={patient._id}>
                <Card className="patient-card" sx={{ height: '100%' }}>
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
                        {patient.name.charAt(0).toUpperCase()}
                      </Box>
                      <Typography variant="h6" noWrap>
                        {patient.name}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {patient.email}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Patient ID: {patient._id.substring(0, 8)}...
                      </Typography>
                    </Box>
                    
                    <Box mt={2} display="flex" justifyContent="center">
                      <Button 
                        component={Link} 
                        to={`/patients/${patient._id}`}
                        variant="contained" 
                        color="primary"
                        fullWidth
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {!searchMode && totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      ) : (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No patients found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchMode 
              ? 'Try a different search term or clear the search' 
              : 'There are no patients in the database yet'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Patients;