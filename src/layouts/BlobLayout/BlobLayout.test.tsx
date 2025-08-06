import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BlobLayout from './BlobLayout';

// Mock the child components
vi.mock('./BlobBackground ', () => ({
  default: function MockBlobBackground({ className, isAnimating }: { className?: string; isAnimating?: boolean }) {
    return <div data-testid="blob-background" className={className} data-animating={isAnimating}>BlobBackground</div>;
  }
}));

vi.mock('../../components/AnimationPlayButton/AnimationPlayButton', () => ({
  default: function MockAnimationToggle({ isAnimating, onToggle }: { isAnimating: boolean; onToggle: () => void }) {
    return <button data-testid="animation-toggle" data-animating={isAnimating} onClick={onToggle}>AnimationToggle!!!</button>;
  }
}));

describe('BlobLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with proper accessibility and structure', () => {
    render(
      <MemoryRouter>
        <BlobLayout />
      </MemoryRouter>
    );
    
    // Check main layout elements are present
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('blob-background')).toBeInTheDocument();
    expect(screen.getByTestId('animation-toggle')).toBeInTheDocument();
    
    // Check semantic structure
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('should handle animation toggle functionality', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <BlobLayout />
      </MemoryRouter>
    );
    
    const toggleButton = screen.getByTestId('animation-toggle');
    
    // Check initial state
    expect(toggleButton).toHaveAttribute('data-animating', 'true');
    
    // Toggle animation off
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('data-animating', 'false');
    
    // Toggle animation back on
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('data-animating', 'true');
  });

  it('should handle keyboard navigation for animation toggle', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <BlobLayout />
      </MemoryRouter>
    );
    
    const toggleButton = screen.getByTestId('animation-toggle');
    
    // Navigate to button and activate with Enter
    await user.tab();
    await user.keyboard('{Enter}');
    
    expect(toggleButton).toHaveAttribute('data-animating', 'false');
  });

  it('should have proper ARIA attributes for animation toggle', () => {
    render(
      <MemoryRouter>
        <BlobLayout />
      </MemoryRouter>
    );
    
    const toggleButton = screen.getByTestId('animation-toggle');
    
    // Check button has proper attributes
    expect(toggleButton).not.toBeDisabled();
    expect(toggleButton).toHaveAccessibleName();
  });

  it('should render outlet content properly', () => {
    render(
      <MemoryRouter>
        <BlobLayout />
      </MemoryRouter>
    );
    
    // Check that the main content area exists for the outlet
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('layout__content');
  });

  it('should maintain focus management', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <BlobLayout />
      </MemoryRouter>
    );
    
    const toggleButton = screen.getByTestId('animation-toggle');
    
    // Check focus can move to the toggle button
    await user.tab();
    expect(toggleButton).toHaveFocus();
  });

  it('should have proper CSS classes', () => {
    render(
      <MemoryRouter>
        <BlobLayout />
      </MemoryRouter>
    );
    
    const layout = screen.getByRole('main').parentElement;
    expect(layout).toHaveClass('layout');
    expect(screen.getByRole('main')).toHaveClass('layout__content');
  });

  it('should be responsive and accessible', () => {
    render(
      <MemoryRouter>
        <BlobLayout />
      </MemoryRouter>
    );
    
    // Check that all interactive elements are accessible
    const interactiveElements = screen.getAllByRole('button');
    expect(interactiveElements.length).toBeGreaterThan(0);
    
    // Check that each button has proper accessible name
    interactiveElements.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
    
    // Check main content area is properly structured
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
}); 