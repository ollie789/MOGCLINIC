import React from 'react';
import { Typography, Box, Alert } from '@mui/material';

const Booking = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Appointment Booking
      </Typography>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        The booking system is currently under development.
      </Alert>
    </Box>
  );
};

export default Booking; 