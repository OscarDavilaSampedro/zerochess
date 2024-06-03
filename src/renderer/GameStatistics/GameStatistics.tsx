import { Button, Paper, Stack, Box } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { GameDecorator } from '../../interfaces';
import { useNavigate } from 'react-router-dom';
import StatsPieChart from './StatsPieChart';
import { BarChart } from '@mui/x-charts';
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
    winsAsWhite: 0,
    winsAsBlack: 0,
    winsAgainstLowerRating: 0,
    winsAgainstHigherRating: 0,
    modeWins: new Map<string, number>(),
  };
  const navigate = useNavigate();

  games.forEach((gameDecorator) => {
    const game = gameDecorator.getGame();
    const playerSide = gameDecorator.getSide(username);
    const opponentSide = gameDecorator.getOpponentSide(username);

    if (game.status === 'draw') {
      stats.draws += 1;
    } else if (game.winner === playerSide) {
      if (playerSide === 'white') {
        stats.winsAsWhite += 1;
      } else {
        stats.winsAsBlack += 1;
      }

      const playerRating = game.players[playerSide].rating;
      const opponentRating = game.players[opponentSide].rating;
      if (playerRating && opponentRating) {
        if (playerRating > opponentRating) {
          stats.winsAgainstLowerRating += 1;
        } else {
          stats.winsAgainstHigherRating += 1;
        }
      }

      let speedWins = stats.modeWins.get(game.speed);
      if (speedWins) {
        speedWins += 1;
        stats.modeWins.set(game.speed, speedWins);
      } else {
        stats.modeWins.set(game.speed, 1);
      }
    } else {
      stats.losses += 1;
    }
  });

  const handleBack = () => {
    navigate('/games');
  };

  function parseModeWins() {
    const flatArray = Array.from(stats.modeWins);
    const firstThree = flatArray.sort((a, b) => b[1] - a[1]).slice(0, 3);

    const keys = firstThree.map((p) => p[0]);
    const values = firstThree.map((p) => p[1]);

    return { keys, values };
  }

  const { keys, values } = parseModeWins();

  return (
    <Paper className="paper">
      <Stack>
        <h1 className="h1-margin">Estadísticas de {username}</h1>
        <Carousel className="carousel">
          <Box>
            <h2>Victorias</h2>
            <Stack spacing={2} direction="row" justifyContent="space-evenly">
              <Box className="box">
                <h3>V/E/D</h3>
                <StatsPieChart
                  data={[
                    {
                      value: stats.winsAsWhite + stats.winsAsBlack,
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
              </Box>
              <Box className="box">
                <h3>Blancas/Negras</h3>
                <StatsPieChart
                  data={[
                    {
                      value: stats.winsAsWhite,
                      color: 'white',
                      label: 'Victorias con blancas',
                    },
                    {
                      value: stats.winsAsBlack,
                      color: '#2F4F4F',
                      label: 'Victorias con negras',
                    },
                  ]}
                />
              </Box>
              <Box className="box">
                <h3>-/+ Elo</h3>
                <StatsPieChart
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
              </Box>
              <Box>
                <h3 className="h3-margin">Por modo</h3>
                <Box width={200}>
                  <BarChart
                    width={250}
                    height={200}
                    series={[{ data: values }]}
                    xAxis={[{ scaleType: 'band', data: keys }]}
                  />
                </Box>
              </Box>
            </Stack>
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
