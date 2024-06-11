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
  const Icon = side === 'white' ? Circle : PanoramaFishEye;
  const { accuracy, inaccuracies, mistakes, blunders } =
    game.getGame().analysis!;
  const sideInaccuracies = inaccuracies[`${side}Player`];
  const sideMistakes = mistakes[`${side}Player`];
  const sideBlunders = blunders[`${side}Player`];

  return (
    <Stack className="stack">
      <div className="row">
        <Icon sx={{ flex: '0 1 4ch', fontSize: '1.5em' }} />
        <span>{game.parsePlayerName(side)}</span>
      </div>
      <div className={`row ${sideInaccuracies > 0 ? 'inaccuracies' : ''}`}>
        <span>{sideInaccuracies}</span>
        <span>{sideInaccuracies === 1 ? 'imprecisión' : 'imprecisiones'}</span>
      </div>
      <div className={`row ${sideMistakes > 0 ? 'mistakes' : ''}`}>
        <span>{sideMistakes}</span>
        <span>{sideMistakes === 1 ? 'error' : 'errores'}</span>
      </div>
      <div className={`row ${sideBlunders > 0 ? 'blunders' : ''}`}>
        <span>{sideBlunders}</span>
        <span>{sideBlunders === 1 ? 'error grave' : 'errores graves'}</span>
      </div>
      <div className="row">
        <span>{Math.round(accuracy[`${side}PlayerAverage`])}%</span>
        <span>Precisión</span>
      </div>
    </Stack>
  );
}
