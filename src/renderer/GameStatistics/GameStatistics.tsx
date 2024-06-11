import { Button, Paper, Stack, Box } from '@mui/material';
import { Game, GameDecorator } from '../../interfaces';
import Carousel from 'react-material-ui-carousel';
import { useNavigate } from 'react-router-dom';
import StatsPieChart from './StatsPieChart';
import StatsBarChart from './StatsBarChart';
import './GameStatistics.css';

export default function GameStatistics({
  games,
  username,
}: {
  username: string;
  games: GameDecorator[];
}) {
  const stats = {
    draws: 0,
    losses: 0,
    blunders: 0,
    mistakes: 0,
    inaccuracies: 0,
    whiteWins: 0,
    blackWins: 0,
    whiteErrors: 0,
    blackErrors: 0,
    winsAgainstLowerRating: 0,
    winsAgainstHigherRating: 0,
    errorsAgainstLowerRating: 0,
    errorsAgainstHigherRating: 0,
    modeWins: new Map<string, number>(),
    modeErrors: new Map<string, number>(),
  };
  const navigate = useNavigate();

  const updateMistakes = (
    game: Game,
    playerSide: string,
    playerRating: number | undefined,
    opponentRating: number | undefined,
  ) => {
    const blunders = game.analysis!.blunders[`${playerSide}Player`];
    const mistakes = game.analysis!.mistakes[`${playerSide}Player`];
    const inaccuracies = game.analysis!.inaccuracies[`${playerSide}Player`];

    stats.blunders += blunders;
    stats.mistakes += mistakes;
    stats.inaccuracies += inaccuracies;

    const totalErrors = blunders + mistakes + inaccuracies;
    if (playerSide === 'white') {
      stats.whiteErrors += totalErrors;
    } else {
      stats.blackErrors += totalErrors;
    }

    if (playerRating && opponentRating) {
      if (playerRating > opponentRating) {
        stats.errorsAgainstLowerRating += totalErrors;
      } else {
        stats.errorsAgainstHigherRating += totalErrors;
      }
    }

    const speedErrors = stats.modeErrors.get(game.speed) || 0;
    stats.modeErrors.set(game.speed, speedErrors + totalErrors);
  };

  const updateWins = (
    gameSpeed: string,
    playerSide: string,
    playerRating: number | undefined,
    opponentRating: number | undefined,
  ) => {
    if (playerSide === 'white') {
      stats.whiteWins += 1;
    } else {
      stats.blackWins += 1;
    }

    if (playerRating && opponentRating) {
      if (playerRating > opponentRating) {
        stats.winsAgainstLowerRating += 1;
      } else {
        stats.winsAgainstHigherRating += 1;
      }
    }

    const speedWins = stats.modeWins.get(gameSpeed) || 0;
    stats.modeWins.set(gameSpeed, speedWins + 1);
  };

  const updateResults = (
    game: Game,
    playerSide: string,
    playerRating: number | undefined,
    opponentRating: number | undefined,
  ) => {
    if (game.status === 'draw') {
      stats.draws += 1;
    } else if (game.winner === playerSide) {
      updateWins(game.speed, playerSide, playerRating, opponentRating);
    } else {
      stats.losses += 1;
    }
  };

  const updateStats = (gameDecorator: GameDecorator) => {
    const game = gameDecorator.getGame();
    const playerSide = gameDecorator.getSide(username);
    const opponentSide = gameDecorator.getOpponentSide(username);

    const playerRating = game.players[playerSide].rating;
    const opponentRating = game.players[opponentSide].rating;

    if (game.analysis) {
      updateMistakes(game, playerSide, playerRating, opponentRating);
    }
    updateResults(game, playerSide, playerRating, opponentRating);
  };

  games.forEach(updateStats);

  function parseMap(map: Map<string, number>) {
    const flatArray = Array.from(map);
    const firstThree = flatArray.sort((a, b) => b[1] - a[1]).slice(0, 3);

    const keys = firstThree.map((p) => p[0]);
    const values = firstThree.map((p) => p[1]);

    return { keys, values };
  }

  const parsedWins = parseMap(stats.modeWins);
  const parsedErrors = parseMap(stats.modeErrors);

  const handleBack = () => {
    navigate('/games');
  };

  const hasErrors = stats.blunders + stats.mistakes + stats.inaccuracies > 0;

  return (
    <Paper className="paper">
      <Stack>
        <h1 className="h1-margin">Estadísticas de {username}</h1>
        <Carousel
          interval={8000}
          animation="slide"
          stopAutoPlayOnHover
          className="carousel"
        >
          <Box>
            <h2>Victorias</h2>
            <Stack spacing={2} direction="row" justifyContent="space-evenly">
              <StatsPieChart
                title="V/E/D"
                data={[
                  {
                    value: stats.whiteWins + stats.blackWins,
                    color: '#C1E1C1',
                    label: 'Victorias',
                  },
                  { value: stats.draws, color: '#A7C7E7', label: 'Empates' },
                  {
                    value: stats.losses,
                    color: '#FAA0A0',
                    label: 'Derrotas',
                  },
                ]}
              />
              <StatsPieChart
                title="Blancas/Negras"
                data={[
                  {
                    value: stats.whiteWins,
                    color: 'white',
                    label: 'Victorias con blancas',
                  },
                  {
                    value: stats.blackWins,
                    color: '#2F4F4F',
                    label: 'Victorias con negras',
                  },
                ]}
              />
              <StatsPieChart
                title="-/+ Elo"
                data={[
                  {
                    value: stats.winsAgainstLowerRating,
                    color: '#E6E6FA',
                    label: 'Victorias contra jugadores de menor Elo',
                  },
                  {
                    value: stats.winsAgainstHigherRating,
                    color: '#483D8B',
                    label: 'Victorias contra jugadores de mayor Elo',
                  },
                ]}
              />
              <StatsBarChart
                title="Por modo"
                keys={parsedWins.keys}
                values={parsedWins.values}
              />
            </Stack>
          </Box>
          <Box>
            <h2>Errores</h2>
            {hasErrors ? (
              <Stack spacing={2} direction="row" justifyContent="space-evenly">
                <StatsPieChart
                  title="I/E/EG"
                  data={[
                    {
                      value: stats.inaccuracies,
                      color: '#FFFAA0',
                      label: 'Imprecisiones',
                    },
                    {
                      value: stats.mistakes,
                      color: '#FAC898',
                      label: 'Errores',
                    },
                    {
                      value: stats.blunders,
                      color: '#FAA0A0',
                      label: 'Errores graves',
                    },
                  ]}
                />
                <StatsPieChart
                  title="Blancas/Negras"
                  data={[
                    {
                      value: stats.whiteErrors,
                      color: 'white',
                      label: 'Errores con blancas',
                    },
                    {
                      value: stats.blackErrors,
                      color: '#2F4F4F',
                      label: 'Errores con negras',
                    },
                  ]}
                />
                <StatsPieChart
                  title="-/+ Elo"
                  data={[
                    {
                      value: stats.errorsAgainstLowerRating,
                      color: '#E6E6FA',
                      label: 'Errores contra jugadores de menor Elo',
                    },
                    {
                      value: stats.errorsAgainstHigherRating,
                      color: '#483D8B',
                      label: 'Errores contra jugadores de mayor Elo',
                    },
                  ]}
                />
                <StatsBarChart
                  title="Por modo"
                  keys={parsedErrors.keys}
                  values={parsedErrors.values}
                />
              </Stack>
            ) : (
              <Box className="centered-text" sx={{ height: '16em' }}>
                <p>¡Analiza más partidas!</p>
              </Box>
            )}
          </Box>
        </Carousel>
        <Box className="flex-end">
          <Button color="secondary" variant="contained" onClick={handleBack}>
            Atrás
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
