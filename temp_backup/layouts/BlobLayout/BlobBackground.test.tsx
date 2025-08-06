import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BlobBackground from './BlobBackground';

describe('BlobBackground', () => {
  it('renders the background with default props', () => {
    render(<BlobBackground />);
    
    const background = screen.getByTestId('blob-background');
    expect(background).toHaveClass('gradient-bg');
    expect(background).not.toHaveClass('gradient-bg--paused');
  });

  it('renders with custom className', () => {
    render(<BlobBackground className="custom-class" />);
    
    const background = screen.getByTestId('blob-background');
    expect(background).toHaveClass('gradient-bg', 'custom-class');
  });

  it('applies paused class when animations are disabled', () => {
    render(<BlobBackground isAnimating={false} />);
    
    const background = screen.getByTestId('blob-background');
    expect(background).toHaveClass('gradient-bg--paused');
  });

  it('renders all gradient elements', () => {
    render(<BlobBackground />);
    
    const gradientsContainer = screen.getByTestId('blob-background').querySelector('.gradients-container');
    expect(gradientsContainer).toBeInTheDocument();
    
    // Check for all gradient elements
    expect(gradientsContainer?.querySelector('.g1')).toBeInTheDocument();
    expect(gradientsContainer?.querySelector('.g2')).toBeInTheDocument();
    expect(gradientsContainer?.querySelector('.g3')).toBeInTheDocument();
    expect(gradientsContainer?.querySelector('.g4')).toBeInTheDocument();
    expect(gradientsContainer?.querySelector('.g5')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    const { container } = render(<BlobBackground />);
    
    const background = container.querySelector('.gradient-bg');
    const gradientsContainer = container.querySelector('.gradients-container');
    
    expect(background).toBeInTheDocument();
    expect(gradientsContainer).toBeInTheDocument();
    expect(gradientsContainer?.children).toHaveLength(5);
  });
}); 