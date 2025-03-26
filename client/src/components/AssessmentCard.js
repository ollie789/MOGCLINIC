import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

/**
 * Component to display an assessment in a card format
 */
const AssessmentCard = ({ assessment }) => {
  if (!assessment) return null;

  const formattedDate = new Date(assessment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Format pain level with color indicators
  const getPainLevelColor = (level) => {
    if (level <= 3) return 'success';
    if (level <= 6) return 'warning';
    return 'error';
  };

  return (
    <Card elevation={2} sx={{ mb: 2, border: '1px solid #eee' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" component="div">
            {assessment.userInfo?.name || 'Unknown Patient'}
          </Typography>
          <Chip 
            icon={<AssignmentIcon />} 
            label={formattedDate} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={1}>
          {assessment.userInfo?.email || 'No email provided'}
        </Typography>
        
        {assessment.painLevel && (
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="body2" mr={1}>
              Pain Level:
            </Typography>
            <Chip 
              label={assessment.painLevel} 
              size="small" 
              color={getPainLevelColor(assessment.painLevel)} 
            />
          </Box>
        )}
        
        {assessment.medicalConditions && (
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              Medical Conditions:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {assessment.medicalConditions.herniatedDisc && (
                <Chip label="Herniated Disc" size="small" color="secondary" variant="outlined" />
              )}
              {assessment.medicalConditions.spinalStenosis && (
                <Chip label="Spinal Stenosis" size="small" color="secondary" variant="outlined" />
              )}
              {assessment.medicalConditions.spondylolisthesis && (
                <Chip label="Spondylolisthesis" size="small" color="secondary" variant="outlined" />
              )}
              {assessment.medicalConditions.scoliosis && (
                <Chip label="Scoliosis" size="small" color="secondary" variant="outlined" />
              )}
              {!assessment.medicalConditions.herniatedDisc && 
                !assessment.medicalConditions.spinalStenosis && 
                !assessment.medicalConditions.spondylolisthesis && 
                !assessment.medicalConditions.scoliosis && (
                <Typography variant="body2" color="text.secondary">
                  None reported
                </Typography>
              )}
            </Box>
          </Box>
        )}
        
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button 
            component={Link} 
            to={`/assessments/${assessment._id}`}
            variant="contained" 
            color="primary"
            size="small"
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssessmentCard; 