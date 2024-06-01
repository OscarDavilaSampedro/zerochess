import { SparkLineChart } from '@mui/x-charts';

export default function AdvantageChart({
  advantage,
}: {
  advantage: (number | string)[];
}) {
  let previousValue = 0;
  const data = advantage.map((item, index) => {
    if (typeof item === 'string') {
      if (!(index > 0 && typeof advantage[index - 1] === 'string')) {
        const sign = item[1];
        if (sign === '+') {
          previousValue += 1;
        } else if (sign === '-') {
          previousValue -= 1;
        }
      }
    } else {
      previousValue = item;
    }

    return previousValue;
  });

  return (
    <SparkLineChart
      area
      showTooltip
      width={500}
      height={240}
      showHighlight
      colors={['#FFAE80']}
      data={data}
      valueFormatter={(v) => {
        return `Ventaja: ${(v! <= 0 ? '' : '+') + v!.toFixed(1)}`;
      }}
    />
  );
}
