import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputInterface from './InputInterface';

describe('InputInterface', () => {
  it('renders a textarea', () => {
    const setUserPrompt = jest.fn();
    render(<InputInterface userPrompt="" setUserPrompt={setUserPrompt} validationWarnings={[]} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('calls setUserPrompt when the user types', () => {
    const setUserPrompt = jest.fn();
    render(<InputInterface userPrompt="" setUserPrompt={setUserPrompt} validationWarnings={[]} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello, World!' } });
    expect(setUserPrompt).toHaveBeenCalledWith('Hello, World!');
  });

  it('displays validation warnings', () => {
    const setUserPrompt = jest.fn();
    const warnings = ['Warning 1', 'Warning 2'];
    render(<InputInterface userPrompt="" setUserPrompt={setUserPrompt} validationWarnings={warnings} />);
    const warning1 = screen.getByText('Warning 1');
    const warning2 = screen.getByText('Warning 2');
    expect(warning1).toBeInTheDocument();
    expect(warning2).toBeInTheDocument();
  });
});
