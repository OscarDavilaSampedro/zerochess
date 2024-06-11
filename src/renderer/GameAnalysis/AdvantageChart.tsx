import { parseAdvantage } from '../../main/services/engine/engineService';
import { SparkLineChart } from '@mui/x-charts';

export default function AdvantageChart({
  advantage,
}: {
  advantage: (number | string)[];
}) {
  return (
    <SparkLineChart
      area
      showTooltip
      width={500}
      height={240}
      showHighlight
      colors={['#FFAE80']}
      data={parseAdvantage(advantage)}
      valueFormatter={(v) => {
        return `Ventaja: ${(v! <= 0 ? '' : '+') + v!.toFixed(1)}`;
      }}
    />
  );
}
