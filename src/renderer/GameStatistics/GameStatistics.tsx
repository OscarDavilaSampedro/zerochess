import { GameDecorator, GameStats } from '../../interfaces';
import { Button, Paper, Stack, Box } from '@mui/material';
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
  const stats = new GameStats();

  const updateStats = (gameDecorator: GameDecorator) => {
    const game = gameDecorator.getGame();
    const playerSide = gameDecorator.getSide(username);
    const opponentSide = gameDecorator.getOpponentSide(username);

    const playerRating = game.players[playerSide].rating;
    const opponentRating = game.players[opponentSide].rating;

    if (game.analysis) {
      stats.updateMistakes(game, playerSide, playerRating, opponentRating);
    }
    stats.updateResults(game, playerSide, playerRating, opponentRating);
  };

  games.forEach(updateStats);

  const parsedWins = stats.getParsedWins();
  const parsedErrors = stats.getParsedErrors();

  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/games');
  };

  const hasErrors = stats.blunders + stats.mistakes + stats.inaccuracies > 0;

  return (
    <Paper className="paper">
      <Stack>
        <h1 className="h1-margin">Estadísticas de {username}</h1>
        <Carousel
          swipe={false}
          interval={8000}
          animation="slide"
          stopAutoPlayOnHover
          className="carousel"
        >
          <Box>
            <h2>Victorias</h2>
            <Stack spacing={2} direction="row" justifyContent="space-evenly">
              <StatsPieChart
                title="V/T/D"
                data={[
                  {
                    value: stats.whiteWins + stats.blackWins,
                    color: '#C1E1C1',
                    label: 'Victorias',
                  },
                  { value: stats.draws, color: '#A7C7E7', label: 'Tablas' },
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
