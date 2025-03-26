import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '../utils/api';

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

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [directData, setDirectData] = useState(null);
  const [serverBaseUrl, setServerBaseUrl] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (searching) return; // Don't fetch when searching
      
      try {
        setLoading(true);
        console.log('Fetching assessments data...');
        
        // Try the multi-URL approach
        const { baseUrl, data } = await attemptDataFetch();
        setServerBaseUrl(baseUrl);
        setDirectData(data);
        
        // Process the data
        setAssessments(data.data);
        setTotalCount(data.count);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching assessments:', err);
        setError('Failed to load assessments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [page, rowsPerPage, searching]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearching(false);
      return;
    }

    try {
      setLoading(true);
      setSearching(true);
      
      const res = await api.get(`/api/assessments/search?query=${searchQuery}`);
      setSearchResults(res.data);
      setError(null);
    } catch (err) {
      console.error('Error searching assessments:', err);
      setError('Failed to search assessments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      setSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const displayedAssessments = searching ? searchResults : assessments;

  if (loading && !displayedAssessments.length) {
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
          Patient Assessments
        </Typography>
        
        <TextField
          placeholder="Search by patient name or email..."
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

      {serverBaseUrl && !error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Connected to data server at: {serverBaseUrl}
          <br />
          {totalCount} assessments available
        </Alert>
      )}

      {searching && (
        <Box mb={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found for "{searchQuery}"
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={() => {
                setSearchQuery('');
                setSearching(false);
              }}
            >
              Clear search
            </Button>
          </Paper>
        </Box>
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedAssessments.length > 0 ? (
                displayedAssessments.map((assessment) => (
                  <TableRow key={assessment._id} hover>
                    <TableCell>{assessment.userInfo.name}</TableCell>
                    <TableCell>{assessment.userInfo.email}</TableCell>
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
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/assessments/${assessment._id}`}
                        startIcon={<VisibilityIcon />}
                        variant="contained"
                        color="primary"
                        size="small"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" color="text.secondary" py={3}>
                      {searching 
                        ? 'No assessments found matching your search criteria' 
                        : 'No assessments available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {!searching && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Assessments; 