import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../components/Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should apply different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();

    rerender(<Button variant="text">Text</Button>);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('should apply different colors', () => {
    const { rerender } = render(<Button color="primary">Primary Color</Button>);
    expect(screen.getByText('Primary Color')).toBeInTheDocument();

    rerender(<Button color="secondary">Secondary Color</Button>);
    expect(screen.getByText('Secondary Color')).toBeInTheDocument();

    rerender(<Button color="error">Error Color</Button>);
    expect(screen.getByText('Error Color')).toBeInTheDocument();
  });

  it('should apply different sizes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByText('Small')).toBeInTheDocument();

    rerender(<Button size="medium">Medium</Button>);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<Button size="large">Large</Button>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('should be full width when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByText('Full Width')).toBeInTheDocument();
  });
});