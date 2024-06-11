import { BarChart } from '@mui/x-charts';
import { Box } from '@mui/material';

export default function StatsBarChart({
  keys,
  title,
  values,
}: {
  title: string;
  keys: string[];
  values: number[];
}) {
  return (
    <Box>
      <h3 className="h3-margin">{title}</h3>
      {keys.length > 0 ? (
        <Box width={200}>
          <BarChart
            width={250}
            height={200}
            series={[{ data: values }]}
            xAxis={[{ scaleType: 'band', data: keys }]}
          />
        </Box>
      ) : (
        <Box
          className="centered-text"
          sx={{ height: '12.5em', marginLeft: '3em' }}
        >
          <p>¡Juega más partidas!</p>
        </Box>
      )}
    </Box>
  );
}
