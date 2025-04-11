import { render } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    const appComponent = getByTestId('app-component');
    expect(appComponent).toBeInTheDocument();
  });
});