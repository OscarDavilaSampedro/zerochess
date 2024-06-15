jest.mock('@mui/x-charts', () => ({
  SparkLineChart: jest.fn(),
  BarChart: jest.fn(),
  PieChart: jest.fn(),
}));

const useNavigateMock = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => useNavigateMock,
}));

export default useNavigateMock;
