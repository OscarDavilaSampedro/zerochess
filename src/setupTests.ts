jest.mock('@mui/x-charts', () => ({
  SparkLineChart: jest.fn(),
  Barchart: jest.fn(),
  Piechart: jest.fn(),
}));
