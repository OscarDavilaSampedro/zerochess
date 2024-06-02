import { Circle, PanoramaFishEye } from '@mui/icons-material';
import { GameDecorator } from '../../../interfaces';
import { Stack } from '@mui/material';
import './AdviceSummary.css';

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
    <Stack className="stack">
      <div className="row">
        <Icon sx={{ flex: '0 1 4ch', fontSize: '1.5em' }} />
        <span>{game.parsePlayerName(side)}</span>
      </div>
      <div className={`row ${inaccuracies > 0 ? 'inaccuracies' : ''}`}>
        <span>{inaccuracies}</span>
        <span>{inaccuracies === 1 ? 'imprecisión' : 'imprecisiones'}</span>
      </div>
      <div className={`row ${mistakes > 0 ? 'mistakes' : ''}`}>
        <span>{mistakes}</span>
        <span>{mistakes === 1 ? 'error' : 'errores'}</span>
      </div>
      <div className={`row ${blunders > 0 ? 'blunders' : ''}`}>
        <span>{blunders}</span>
        <span>{blunders === 1 ? 'error grave' : 'errores graves'}</span>
      </div>
      <div className="row">
        <span>{Math.round(accuracy[`${side}PlayerAverage`])}%</span>
        <span>Precisión</span>
      </div>
    </Stack>
  );
}
