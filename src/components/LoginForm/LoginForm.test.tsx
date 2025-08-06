import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';

// Mock the validation functions
vi.mock('../../utils/validation', () => ({
  validateEmail: vi.fn((email: string) => {
    if (!email) return 'Email is required.';
    if (!email.includes('@')) return 'Enter a valid email address.';
    return '';
  }),
  validatePassword: vi.fn((password: string) => {
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  }),
}));

// Mock the cookies utilities
vi.mock('../../utils/cookies', () => ({
  setRememberMeToken: vi.fn(),
  setRememberMePreference: vi.fn(),
  getRememberMePreference: vi.fn(() => false),
  getRememberMeToken: vi.fn(() => null),
  removeRememberMeToken: vi.fn(),
}));

describe('LoginForm', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with proper accessibility and form structure', () => {
    render(<LoginForm {...defaultProps} />);
    
    // Check all form elements are present
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    
    // Check accessibility features
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('novalidate');
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
  });

  it('should handle successful login flow', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<LoginForm {...defaultProps} onSuccess={onSuccess} />);
    
    // Fill and submit form
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const inputs = screen.getAllByDisplayValue('');
    const passwordInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);
    
    // Check loading state
    expect(submitButton).toHaveTextContent('Logging in…');
    expect(submitButton).toBeDisabled();
    
    // Check success callback
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should handle login failure with proper error display', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const inputs = screen.getAllByDisplayValue('');
    const passwordInput = inputs[1];
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'WrongPassword123!');
    await user.click(submitButton);
    
    // Check error message
    await waitFor(() => {
      const errorElement = screen.getByText('Invalid email or password');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });

  it('should validate form fields and show appropriate errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const inputs = screen.getAllByDisplayValue('');
    const passwordInput = inputs[1];
    
    // Focus and blur fields to trigger validation
    await user.click(emailInput);
    await user.tab();
    await user.click(passwordInput);
    await user.tab();
    
    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
    });
  });

  it('should handle remember me functionality', async () => {
    const user = userEvent.setup();
    const { setRememberMeToken, setRememberMePreference } = await import('../../utils/cookies');
    render(<LoginForm {...defaultProps} />);
    
    // Fill form with remember me checked
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const inputs = screen.getAllByDisplayValue('');
    const passwordInput = inputs[1];
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(rememberMeCheckbox);
    await user.click(submitButton);
    
    // Check remember me preferences are saved
    await waitFor(() => {
      expect(setRememberMeToken).toHaveBeenCalledWith('mock-token');
      expect(setRememberMePreference).toHaveBeenCalledWith(true);
    }, { timeout: 2000 });
  });

  it('should handle keyboard navigation and form submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<LoginForm {...defaultProps} onSuccess={onSuccess} />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const inputs = screen.getAllByDisplayValue('');
    const passwordInput = inputs[1];
    
    // Fill form using keyboard
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.keyboard('{Enter}');
    
    // Check form was submitted
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should handle session resume when remember me token exists', async () => {
    const { getRememberMeToken } = await import('../../utils/cookies');
    (getRememberMeToken as ReturnType<typeof vi.fn>).mockReturnValue('mock-token');
    const onSuccess = vi.fn();
    
    render(<LoginForm {...defaultProps} onSuccess={onSuccess} />);
    
    // Check session resume is attempted
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should prefill email when provided', () => {
    render(<LoginForm {...defaultProps} prefilledEmail="test@example.com" />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should clear errors when form is resubmitted with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm {...defaultProps} />);
    
    // First submission with wrong credentials
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInputs = screen.getAllByDisplayValue('');
    const passwordInput = passwordInputs.find(input => input.getAttribute('type') === 'password');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(emailInput, 'wrong@example.com');
    if (passwordInput) {
      await user.type(passwordInput, 'WrongPassword123!');
      await user.click(submitButton);
    }
    
    // Check error appears
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
    
    // Resubmit with correct credentials
    await user.clear(emailInput);
    if (passwordInput) {
      await user.clear(passwordInput);
      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.click(submitButton);
    }
    
    // Check error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });
}); 