import { Circle, PanoramaFishEye } from '@mui/icons-material';
import { GameDecorator } from '../../../interfaces';
import { Stack } from '@mui/material';

export default function AdviceSummarySide({
  side,
  game,
}: {
  side: string;
  game: GameDecorator;
}) {
  const { advantage, accuracy } = game.getGame().analysis!;

  const calculateErrors = (threshold1: number, threshold2: number) => {
    return advantage.filter((a: number, i: number) => {
      if (side === 'white') {
        return (
          i < advantage.length - 1 &&
          advantage[i + 1] - a >= threshold1 &&
          advantage[i + 1] - a < threshold2
        );
      }
      return (
        i < advantage.length - 1 &&
        a - advantage[i + 1] >= threshold1 &&
        a - advantage[i + 1] < threshold2
      );
    }).length;
  };

  const mistakes = calculateErrors(1, 1.5);
  const inaccuracies = calculateErrors(0.5, 1);
  const blunders = calculateErrors(1.5, Infinity);
  const Icon = side === 'white' ? Circle : PanoramaFishEye;

  return (
    <Stack sx={{ width: '11em', fontSize: '0.75em' }}>
      <div style={{ display: 'flex' }}>
        <Icon style={{ flex: '0 1 4ch', fontSize: '1.5em' }} />
        <span>{game.parsePlayerName(side)}</span>
      </div>
      <div
        style={{
          display: 'flex',
          color: `${inaccuracies > 0 ? '#53b2ea' : 'inherit'}`,
        }}
      >
        <span style={{ flex: '0 1 6ch', textAlign: 'center' }}>
          {inaccuracies}
        </span>
        <span>{inaccuracies === 1 ? 'imprecisión' : 'imprecisiones'}</span>
      </div>
      <div
        style={{
          display: 'flex',
          color: `${mistakes > 0 ? '#e69d00' : 'inherit'}`,
        }}
      >
        <span style={{ flex: '0 1 6ch', textAlign: 'center' }}>{mistakes}</span>
        <span>{mistakes === 1 ? 'error' : 'errores'}</span>
      </div>
      <div
        style={{
          display: 'flex',
          color: `${blunders > 0 ? '#df5353' : 'inherit'}`,
        }}
      >
        <span style={{ flex: '0 1 6ch', textAlign: 'center' }}>{blunders}</span>
        <span>{blunders === 1 ? 'error grave' : 'errores graves'}</span>
      </div>
      <div style={{ display: 'flex' }}>
        <span style={{ flex: '0 1 6ch', textAlign: 'center' }}>
          {Math.round(accuracy[`${side}PlayerAverage`])}%
        </span>
        <span>Precisión</span>
      </div>
    </Stack>
  );
}
