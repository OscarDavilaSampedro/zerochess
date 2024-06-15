import { act, fireEvent, render, screen } from '@testing-library/react';
import { GameDecorator } from '../../interfaces';
import { generateGame } from '../../main/util';
import useNavigateMock from '../../setupTests';
import GameStatistics from './GameStatistics';
import '@testing-library/jest-dom';

describe('GameStatistics component', () => {
  beforeEach(() => {
    useNavigateMock.mockReset();
  });

  it('should render', () => {
    const username = 'testUser';
    render(<GameStatistics username={username} games={[]} />);

    const headingElement = screen.getByRole('heading', {
      name: `Estadísticas de ${username}`,
    });

    expect(headingElement).toBeInTheDocument();
  });

  it('should display a message when there are no games or no errors', () => {
    const { rerender } = render(<GameStatistics username="" games={[]} />);

    const pMMBefore = screen.getAllByText(/¡Juega más partidas!/i);
    const aMMBefore = screen.getByText(/¡Analiza más partidas!/i);

    expect(pMMBefore.length).toBeGreaterThan(0);
    expect(aMMBefore).toBeInTheDocument();

    rerender(
      <GameStatistics
        username=""
        games={[new GameDecorator(generateGame())]}
      />,
    );

    const pMMAfter = screen.getAllByText(/¡Juega más partidas!/i);

    expect(pMMAfter.length).toBeLessThan(pMMBefore.length);

    rerender(
      <GameStatistics
        username=""
        games={[
          new GameDecorator(
            generateGame({
              analysis: {
                blunders: { whitePlayer: 1, blackPlayer: 1 },
                mistakes: { whitePlayer: 1, blackPlayer: 1 },
                inaccuracies: { whitePlayer: 1, blackPlayer: 1 },
              },
            }),
          ),
        ]}
      />,
    );

    const aMMAfter = screen.queryByText(/¡Analiza más partidas!/i);

    expect(aMMAfter).toBeNull();
  });

  it('should trigger navigation when clicking back button', async () => {
    render(<GameStatistics username="" games={[]} />);

    const backButton = screen.getByRole('button', {
      name: /Atrás/i,
    });

    await act(async () => {
      fireEvent.click(backButton);
    });

    expect(useNavigateMock).toHaveBeenCalledWith('/games');
  });
});
