import { Box, LinearProgress, Typography } from '@mui/material';

export default function LinearProgressWithLabel({
  progress,
}: {
  progress: number;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography>{`${Math.round(progress)}%`}</Typography>
      </Box>
    </Box>
  );
}
