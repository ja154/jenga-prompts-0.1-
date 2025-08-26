import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Generate from './Generate';

describe('Generate', () => {
  it('renders a button', () => {
    const handleGenerateClick = jest.fn();
    render(<Generate isLoading={false} userPrompt="test" handleGenerateClick={handleGenerateClick} />);
    const button = screen.getByTestId('generate-button');
    expect(button).toBeInTheDocument();
  });

  it('button is disabled when isLoading is true', () => {
    const handleGenerateClick = jest.fn();
    render(<Generate isLoading={true} userPrompt="test" handleGenerateClick={handleGenerateClick} />);
    const button = screen.getByTestId('generate-button');
    expect(button).toBeDisabled();
  });

  it('button is disabled when userPrompt is empty', () => {
    const handleGenerateClick = jest.fn();
    render(<Generate isLoading={false} userPrompt="" handleGenerateClick={handleGenerateClick} />);
    const button = screen.getByTestId('generate-button');
    expect(button).toBeDisabled();
  });

  it('calls handleGenerateClick when clicked', () => {
    const handleGenerateClick = jest.fn();
    render(<Generate isLoading={false} userPrompt="test" handleGenerateClick={handleGenerateClick} />);
    const button = screen.getByTestId('generate-button');
    fireEvent.click(button);
    expect(handleGenerateClick).toHaveBeenCalledTimes(1);
  });
});
