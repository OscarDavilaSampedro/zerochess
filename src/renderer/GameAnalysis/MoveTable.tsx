import { TableRow, TableCell, Table, TableBody, Box } from '@mui/material';
import { useEffect, useRef } from 'react';

export default function MoveTable({
  moves,
  advantage,
  currentIndex,
}: {
  moves: string[];
  advantage: number[];
  currentIndex: number;
}) {
  const tableRows = [];
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  function scrollTo(cellIndex: number) {
    rowRefs.current[cellIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }

  useEffect(() => {
    let cellIndex = currentIndex;
    if (currentIndex === 0) {
      cellIndex += 1;
    }
    if (currentIndex === moves.length) {
      cellIndex += -1;
    }

    scrollTo(cellIndex);
  }, [currentIndex, moves.length]);

  function formatAdvantage(rawAdvantage: number) {
    let formattedAdvantage = '';
    if (rawAdvantage !== undefined) {
      const formattedNumber = rawAdvantage.toFixed(1);
      formattedAdvantage = (rawAdvantage <= 0 ? '' : '+') + formattedNumber;
    }

    return formattedAdvantage;
  }

  for (let i = 0; i < moves.length; i += 2) {
    tableRows.push(
      <TableRow
        key={i}
        ref={(el) => {
          rowRefs.current[i + 1] = el;
        }}
      >
        <TableCell>{i / 2 + 1}</TableCell>
        <TableCell
          sx={{
            color: currentIndex === i + 1 ? '#000000' : 'inherit',
            backgroundColor: currentIndex === i + 1 ? '#B1D5F6' : 'inherit',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{moves[i]}</span>
            <span>{formatAdvantage(advantage[i])}</span>
          </div>
        </TableCell>
        <TableCell
          sx={{
            color: currentIndex === i + 2 ? '#000000' : 'inherit',
            backgroundColor: currentIndex === i + 2 ? '#B1D5F6' : 'inherit',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{moves[i + 1] || ''}</span>
            <span>{formatAdvantage(advantage[i + 1])}</span>
          </div>
        </TableCell>
      </TableRow>,
    );
  }

  return (
    <Box sx={{ maxHeight: '50vh', overflow: 'auto' }}>
      <Table>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </Box>
  );
}