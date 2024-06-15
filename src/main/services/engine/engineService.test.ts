import { getGameAccuracy, getGameAdvantage, calculateErrors } from './engineService';

const getGameCentipawnsMock = jest.fn();
jest.mock('./helpers/engine', () => ({
  getGameCentipawns: () => getGameCentipawnsMock(),
}));

describe('Chess Game Analysis Functions', () => {
  describe('getGameAccuracy', () => {
    it('should calculate accuracy averages correctly', async () => {
      getGameCentipawnsMock.mockResolvedValueOnce([1000, 0]);

      let result = await getGameAccuracy([]);
      expect(result).toEqual({
        whitePlayerAverage: 100,
        blackPlayerAverage: 100,
      });

      getGameCentipawnsMock.mockResolvedValueOnce([-1000, 0]);

      result = await getGameAccuracy([]);
      expect(result).toEqual({
        whitePlayerAverage: 0,
        blackPlayerAverage: 0,
      });

      getGameCentipawnsMock.mockResolvedValueOnce([-1000, -2000]);

      result = await getGameAccuracy([]);
      expect(result).toEqual({
        whitePlayerAverage: 0,
        blackPlayerAverage: 100,
      });
    });
  });

  describe('getGameAdvantage', () => {
    it('should calculate advantage correctly', async () => {
      getGameCentipawnsMock.mockResolvedValueOnce([150, -150, '#0']);

      const result = await getGameAdvantage([]);
      expect(result).toEqual([1.5, -1.5, '#0']);
    });
  });

  describe('calculateErrors', () => {
    it('should calculate inaccuracies correctly', () => {
      const advantage = [0.7, 0, -0.7, 0, -0.4, 0, -1, 0];

      const result = calculateErrors(advantage, 0.5, 1);
      expect(result).toEqual({
        whitePlayer: 1,
        blackPlayer: 1,
      });
    });

    it('should calculate mistakes correctly', () => {
      const advantage = [1.2, 0, -1.2, 0, -0.9, 0, -1.5, 0];

      const result = calculateErrors(advantage, 1, 1.5);
      expect(result).toEqual({
        whitePlayer: 1,
        blackPlayer: 1,
      });
    });

    it('should calculate blunders correctly', () => {
      const advantage = [1.7, 0, -1.7, 0, -1.4, 0];

      const result = calculateErrors(advantage, 1.5, Infinity);
      expect(result).toEqual({
        whitePlayer: 1,
        blackPlayer: 1,
      });
    });
  });
});
