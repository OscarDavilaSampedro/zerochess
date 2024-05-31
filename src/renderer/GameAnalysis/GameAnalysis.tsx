import { FastForwardRounded, FastRewindRounded, SkipNextRounded, SkipPreviousRounded } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper } from '@mui/material';
import { GameDecorator } from '../../interfaces';
import { useLocation } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import AdvantageChart from './AdvantageChart';
import MoveTable from './MoveTable';
import { Chess } from 'chess.js';
import { useState } from 'react';

export default function GameAnalysis() {
  const { username, game, analysis } = useLocation().state as {
    analysis: { [key: string]: any };
    game: GameDecorator;
    username: string;
  };
  const [boardPosition, setBoardPosition] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  );
  const [currentIndex, setCurrentIndex] = useState(0);

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
          <Chessboard
            boardWidth={500}
            position={boardPosition}
            arePiecesDraggable={false}
            customBoardStyle={{ borderRadius: '5px' }}
            boardOrientation={game.getSide(username)}
          />
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
          <AdvantageChart advantage={analysis.advantage} />
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
