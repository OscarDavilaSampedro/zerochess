import {
  FastForwardRounded,
  FastRewindRounded,
  SkipNextRounded,
  SkipPreviousRounded,
} from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { GameDecorator } from '../../interfaces';
import { SparkLineChart } from '@mui/x-charts';
import { useLocation } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import MoveTable from './MoveTable';
import { Chess } from 'chess.js';
import { useState } from 'react';

export default function GameAnalysis() {
  const [boardPosition, setBoardPosition] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const { username, game, analysis } = useLocation().state as {
    analysis: { [key: string]: any };
    game: GameDecorator;
    username: string;
  };

  function replayMoves(index: number) {
    const moves = game.getGameMoves();
    const chess = new Chess();

    for (let i = 0; i < index; i += 1) {
      chess.move(moves[i]);
    }
    setBoardPosition(chess.fen());

    setCurrentIndex(index);
  }

  const handleBottom = () => {
    replayMoves(0);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      replayMoves(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < game.getGameMoves().length) {
      replayMoves(currentIndex + 1);
    }
  };

  const handleTop = () => {
    replayMoves(game.getGameMoves().length);
  };

  return (
    <Box>
      <Grid container spacing={5}>
        <Grid item xs={8}>
          <div style={{ width: '500px' }}>
            <Chessboard
              position={boardPosition}
              arePiecesDraggable={false}
              customBoardStyle={{ borderRadius: '5px' }}
              boardOrientation={game.getOrientation(username)}
            />
          </div>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <MoveTable
              moves={game.getGameMoves()}
              currentIndex={currentIndex}
              advantage={analysis.advantage}
            />
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <SparkLineChart
            area
            showTooltip
            width={500}
            height={240}
            showHighlight
            colors={['#FFAE80']}
            data={analysis.advantage}
            valueFormatter={(v) => {
              return `Ventaja: ${(v! <= 0 ? '' : '+') + v!.toFixed(1)}`;
            }}
          />
        </Grid>
        <Grid item xs={4}>
          <IconButton onClick={handleBottom}>
            <FastRewindRounded />
          </IconButton>
          <IconButton onClick={handleBack}>
            <SkipPreviousRounded />
          </IconButton>
          <IconButton onClick={handleNext}>
            <SkipNextRounded />
          </IconButton>
          <IconButton onClick={handleTop}>
            <FastForwardRounded />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
}
