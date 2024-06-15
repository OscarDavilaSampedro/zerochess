/* eslint-disable no-await-in-loop */

import { getGameCentipawns } from './helpers/engine';

function calculateWinPercentage(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

function calculateAccuracy(wpBefore: number, wpAfter: number): number {
  const delta = wpBefore - wpAfter;
  const penaltyFactor = delta > 0 ? delta ** 2 : delta;
  return Math.max(
    0,
    Math.min(100, 103.1668 * Math.exp(-0.04354 * penaltyFactor) - 3.1669),
  );
}

function parseMate(mate: string) {
  return parseInt(mate.substring(1), 10) > 0 ? Infinity : -Infinity;
}

export async function getGameAccuracy(moves: string[]) {
  const centipawnsPerNode: (number | string)[] = await getGameCentipawns(moves);
  const winPercentagePerNode: number[] = centipawnsPerNode.map((cp) =>
    typeof cp === 'string'
      ? calculateWinPercentage(parseMate(cp))
      : calculateWinPercentage(cp),
  );
  winPercentagePerNode.unshift(50);

  let whiteSum = 0;
  let blackSum = 0;
  let whiteCount = 0;
  let blackCount = 0;

  for (let i = 0; i < winPercentagePerNode.length - 1; i += 1) {
    if (i % 2 === 0) {
      whiteSum += calculateAccuracy(
        winPercentagePerNode[i],
        winPercentagePerNode[i + 1],
      );
      whiteCount += 1;
    } else {
      blackSum += calculateAccuracy(
        100 - winPercentagePerNode[i],
        100 - winPercentagePerNode[i + 1],
      );
      blackCount += 1;
    }
  }

  const whitePlayerAverage = whiteSum / whiteCount;
  const blackPlayerAverage = blackSum / blackCount;

  return { whitePlayerAverage, blackPlayerAverage };
}

export async function getGameAdvantage(moves: string[]) {
  const centipawnsPerNode: (number | string)[] = await getGameCentipawns(moves);
  const advantagePerNode = centipawnsPerNode.map((cp) =>
    typeof cp === 'number' ? cp / 100 : cp,
  );

  return advantagePerNode;
}

export function parseAdvantage(advantage: (string | number)[]) {
  let previousValue = 0;

  const parsedAdvantage = advantage.map((item, index) => {
    if (typeof item === 'string') {
      if (!(index > 0 && typeof advantage[index - 1] === 'string')) {
        const sign = item[1];
        if (sign === '+') {
          previousValue += 1;
        } else if (sign === '-') {
          previousValue -= 1;
        }
      }
    } else {
      previousValue = item;
    }

    return previousValue;
  });

  return parsedAdvantage;
}

export function calculateErrors(
  advantage: (string | number)[],
  threshold1: number,
  threshold2: number,
) {
  const parsedAdvantage = parseAdvantage(advantage);
  parsedAdvantage.unshift(0);
  const errors = {
    whitePlayer: 0,
    blackPlayer: 0,
  };

  for (let i = 0; i < parsedAdvantage.length - 1; i += 1) {
    const difference = parsedAdvantage[i] - parsedAdvantage[i + 1];
    if (i % 2 === 0) {
      if (difference >= threshold1 && difference < threshold2) {
        errors.whitePlayer += 1;
      }
    } else if (-difference >= threshold1 && -difference < threshold2) {
      errors.blackPlayer += 1;
    }
  }

  return errors;
}
