import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  it('renders a button', () => {
    const toggleTheme = jest.fn();
    render(<ThemeToggle theme="light" toggleTheme={toggleTheme} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    const toggleTheme = jest.fn();
    render(<ThemeToggle theme="light" toggleTheme={toggleTheme} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
