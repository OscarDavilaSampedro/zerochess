import { PieChart } from '@mui/x-charts';
import { Box } from '@mui/material';

export default function StatsPieChart({
  data,
  title,
}: {
  data: any[];
  title: string;
}) {
  const filteredData = data.filter((item) => item.value > 0);

  return (
    <Box className="box">
      <h3>{title}</h3>
      {filteredData.length > 0 ? (
        <Box width={155}>
          <PieChart
            series={[
              {
                innerRadius: 40,
                paddingAngle: 5,
                cornerRadius: 5,
                data: filteredData,
              },
            ]}
            width={250}
            height={200}
            slotProps={{ legend: { hidden: true } }}
          />
        </Box>
      ) : (
        <Box className="centered-text" sx={{ height: '12.5em' }}>
          <p>¡Juega más partidas!</p>
        </Box>
      )}
    </Box>
  );
}
