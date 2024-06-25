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

  function formatAdvantage(rawAdvantage: number | string) {
    switch (typeof rawAdvantage) {
      case 'undefined': {
        return '';
      }
      case 'string': {
        return rawAdvantage;
      }
      default: {
        const formattedNumber = rawAdvantage.toFixed(1);
        return (rawAdvantage <= 0 ? '' : '+') + formattedNumber;
      }
    }
  }

  function getCellStyle(index: number) {
    return {
      color: currentIndex === index ? 'black' : 'inherit',
      backgroundColor: currentIndex === index ? 'primary.main' : 'inherit',
    };
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
        <TableCell sx={getCellStyle(i + 1)}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{moves[i]}</span>
            <span>{formatAdvantage(advantage[i])}</span>
          </div>
        </TableCell>
        <TableCell sx={getCellStyle(i + 2)}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{moves[i + 1] || ''}</span>
            <span>{formatAdvantage(advantage[i + 1])}</span>
          </div>
        </TableCell>
      </TableRow>,
    );
  }

  return (
    <Box sx={{ maxHeight: '31.15em', overflow: 'auto', border: 1 }}>
      <Table>
        <TableBody>{tableRows}</TableBody>
      </Table>
    </Box>
  );
}
