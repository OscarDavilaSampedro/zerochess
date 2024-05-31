import { SparkLineChart } from '@mui/x-charts';

export default function AdvantageChart({
  advantage,
}: {
  advantage: (number | string)[];
}) {
  let previousValue = 0;
  const processedDataWithIndexes = advantage.map((item, index) => {
    if (typeof item === 'string') {
      const sign = item[1];
      switch (sign) {
        case '+': {
          previousValue += 1;
          break;
        }
        case '-': {
          previousValue -= 1;
          break;
        }
        default: {
          previousValue += 0.001;
          break;
        }
      }
    } else {
      previousValue = item;
    }

    return { value: previousValue, index };
  });

  const processedData = processedDataWithIndexes.map(({ value }) => value);
  const originalValueMap = new Map(
    processedDataWithIndexes.map(({ value, index }) => [
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
