import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MoveTable from './MoveTable';

const moves = ['e4', 'e5', 'Nf3', 'Nc6'];
const advantage = [1, -1, 2, -2];
const currentIndex = 1;

const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

describe('MoveTable component', () => {
  it('should render the correct number of rows', () => {
    render(
      <MoveTable
        moves={moves}
        advantage={advantage}
        currentIndex={currentIndex}
      />,
    );

    const rows = screen.getAllByRole('row');

    expect(rows).toHaveLength(moves.length / 2);
  });

  it('should render the correct moves and advantages', () => {
    render(
      <MoveTable
        moves={moves}
        advantage={advantage}
        currentIndex={currentIndex}
      />,
    );

    expect(screen.getByText(moves[0])).toBeInTheDocument();
    expect(screen.getByText('+1.0')).toBeInTheDocument();
    expect(screen.getByText(moves[1])).toBeInTheDocument();
    expect(screen.getByText('-1.0')).toBeInTheDocument();
    expect(screen.getByText(moves[2])).toBeInTheDocument();
    expect(screen.getByText('+2.0')).toBeInTheDocument();
    expect(screen.getByText(moves[3])).toBeInTheDocument();
    expect(screen.getByText('-2.0')).toBeInTheDocument();
  });

  it('should apply correct styles to the current index cell', () => {
    render(
      <MoveTable
        moves={moves}
        advantage={advantage}
        currentIndex={currentIndex}
      />,
    );

    const currentCell = screen.getAllByRole('cell')[currentIndex];

    expect(currentCell).toHaveStyle({
      color: 'black',
      backgroundColor: 'primary.main',
    });
  });
});
