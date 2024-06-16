import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App component', () => {
  it('should render', () => {
    expect(render(<App />)).toBeTruthy();
  });
});
