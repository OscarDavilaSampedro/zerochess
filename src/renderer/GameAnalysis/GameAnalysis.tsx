import { FastForwardRounded, FastRewindRounded, SkipNextRounded, SkipPreviousRounded } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { GameDecorator } from '../../interfaces';
import { SparkLineChart } from '@mui/x-charts';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useState } from 'react';

export default function GameAnalysis({
  selectedGame,
}: {
  selectedGame: GameDecorator;
}) {
  const [boardPosition, setBoardPosition] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  function getGameMoves() {
    const rawGame = selectedGame.getGame();
    const moves = rawGame.moves.split(' ');

    return moves;
  }

  function replayMoves(index: number) {
    const moves = getGameMoves();
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
    if (currentIndex < getGameMoves().length - 1) {
      replayMoves(currentIndex + 1);
    }
  };

  const handleTop = () => {
    replayMoves(getGameMoves().length - 1);
  };

  return (
    <Box>
      <Grid container>
        <Grid item>
          <Chessboard
            position={boardPosition}
            arePiecesDraggable={false}
            customBoardStyle={{ width: '90em' }}
          />
        </Grid>
        <Grid item>
          <Paper />
        </Grid>
        <Grid item>
          <SparkLineChart data={[1, 4, 2, 5, 7, 2, 4, 6]} height={100} />
        </Grid>
        <Grid item>
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
