import { GameDecorator } from '../../../interfaces';
import AdviceSummarySide from './AdviceSummarySide';
import { Stack } from '@mui/material';

export default function AdviceSummary({ game }: { game: GameDecorator }) {
  return (
    <Stack direction="row" justifyContent="space-around">
      <AdviceSummarySide game={game} side="white" />
      <AdviceSummarySide game={game} side="black" />
    </Stack>
  );
}
