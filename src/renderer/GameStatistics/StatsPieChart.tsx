import { PieChart } from '@mui/x-charts';
import { Box } from '@mui/material';

export default function StatsPieChart({ data }: { data: any }) {
  return (
    <Box width={155}>
      <PieChart
        series={[
          {
            data,
            innerRadius: 40,
            paddingAngle: 5,
            cornerRadius: 5,
          },
        ]}
        width={250}
        height={200}
        slotProps={{ legend: { hidden: true } }}
      />
    </Box>
  );
}
