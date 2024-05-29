import { FastForwardRounded, FastRewindRounded, SkipNextRounded, SkipPreviousRounded } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { GameDecorator } from '../../interfaces';
import { SparkLineChart } from '@mui/x-charts';
import { useLocation } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useState } from 'react';

export default function GameAnalysis() {
  const [boardPosition, setBoardPosition] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  );
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { game } = location.state as { game: GameDecorator };

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
    if (currentIndex < game.getGameMoves().length - 1) {
      replayMoves(currentIndex + 1);
    }
  };

  const handleTop = () => {
    replayMoves(game.getGameMoves().length - 1);
  };

  return (
    <Box>
      <Grid container>
        <Grid item xs={6}>
          <Chessboard
            position={boardPosition}
            arePiecesDraggable={false}
            customBoardStyle={{ width: '90em' }}
          />
        </Grid>
        <Grid item xs={6}>
          <Paper />
        </Grid>
        <Grid item xs={6}>
          <SparkLineChart
            area
            showTooltip
            height={100}
            showHighlight
            colors={['#FFAE80']}
            data={[1, -4, 2, 5, 7, 2, 4, 6]}
            valueFormatter={(v) => {
              return `Ventaja: ${(v! < 0 ? '' : '+') + v}`;
            }}
          />
        </Grid>
        <Grid item xs={6}>
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
