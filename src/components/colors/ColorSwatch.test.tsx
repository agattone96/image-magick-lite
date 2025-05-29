import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ColorSwatch from './ColorSwatch'; // Adjust path as necessary

describe('ColorSwatch', () => {
  const testColor = '#1A2B3C'; // A specific hex color for testing
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with the correct background color', () => {
    render(<ColorSwatch color={testColor} />);
    
    // The component renders a div that has the background color.
    // We can find this div by its role or a test ID if added.
    // For now, let's assume the main div (or its direct child) has the style.
    // If the structure is div > div[style], we might need to be more specific.
    // The current ColorSwatch has one main div with the style.
    const swatchElement = screen.getByTitle(testColor); // The title attribute is on the styled div
    
    expect(swatchElement).toBeInTheDocument();
    expect(swatchElement).toHaveStyle(`background-color: ${testColor}`);
  });

  test('calls onClick handler when clicked', () => {
    render(<ColorSwatch color={testColor} onClick={mockOnClick} />);
    const swatchElement = screen.getByTitle(testColor);
    
    fireEvent.click(swatchElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('does not throw error if onClick is not provided and swatch is clicked', () => {
    render(<ColorSwatch color={testColor} />);
    const swatchElement = screen.getByTitle(testColor);
    
    expect(() => fireEvent.click(swatchElement)).not.toThrow();
  });

  test('displays tooltip with color code on hover', () => {
    render(<ColorSwatch color={testColor} />);
    const swatchElement = screen.getByTitle(testColor); // This also checks the basic browser tooltip

    // Simulate hover to show the custom tooltip (if different from title)
    fireEvent.mouseEnter(swatchElement);
    
    // The custom tooltip is rendered conditionally.
    // We expect the text content of the tooltip to be the color code.
    // This requires the tooltip to be in the document after mouseEnter.
    const tooltip = screen.getByText(testColor, { selector: 'div[role="tooltip"], div.absolute' }); // More specific selector if needed
    // For the current implementation, the tooltip is a div with class "absolute ..."
    // and it contains the color code as its text content.
    
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(testColor);

    // Simulate mouse leave to hide the tooltip
    fireEvent.mouseLeave(swatchElement);
    // After mouseLeave, the custom tooltip should ideally be removed from the document.
    // @testing-library/jest-dom doesn't have a direct "toBeHidden" or "not.toBeVisible" that works for conditional rendering (removed from DOM).
    // So, we query for it again and expect it not to be found.
    expect(screen.queryByText(testColor, { selector: 'div[role="tooltip"], div.absolute' })).not.toBeInTheDocument();
  });
  
  test('tooltip is initially hidden', () => {
    render(<ColorSwatch color={testColor} />);
    // Check that the custom tooltip (identified by its specific structure or role) is not present initially.
    // The title attribute will be there, but the custom tooltip div should not.
    expect(screen.queryByText(testColor, { selector: 'div[role="tooltip"], div.absolute' })).not.toBeInTheDocument();
  });

});
