import { SparkLineChart } from '@mui/x-charts';

export default function AdvantageChart({
  advantage,
}: {
  advantage: (number | string)[];
}) {
  let previousValue = 0;

  const processedDataWithIndices = advantage.map((item, index) => {
    if (typeof item === 'string') {
      const sign = item[1];
      if (sign === '+') {
        previousValue += 1;
      } else if (sign === '-') {
        previousValue -= 1;
      } else {
        previousValue += 0.001;
      }
    } else if (typeof item === 'number') {
      previousValue = item;
    }

    return { value: previousValue, index };
  });

  const processedData = processedDataWithIndices.map(({ value }) => value);
  const originalValueMap = new Map(
    processedDataWithIndices.map(({ value, index }) => [
      value,
      advantage[index],
    ]),
  );

  return (
    <SparkLineChart
      area
      showTooltip
      width={500}
      height={240}
      showHighlight
      colors={['#FFAE80']}
      data={processedData}
      valueFormatter={(v) => {
        const originalValue = originalValueMap.get(v!);
        if (typeof originalValue === 'string') {
          return `Ventaja: ${originalValue}`;
        }
        return `Ventaja: ${(v! <= 0 ? '' : '+') + v!.toFixed(1)}`;
      }}
    />
  );
}
