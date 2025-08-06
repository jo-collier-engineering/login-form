import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ForgotPasswordPage from './ForgotPasswordPage';
import { 
  mockValidation, 
  renderWithRouter, 
  fillForgotPasswordForm,
  checkFormAccessibility,
  checkLoadingState,
  checkErrorMessage,
  checkSuccessMessage
} from '../../test-utils';

// Setup mocks
mockValidation();

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

// Mock the child components
vi.mock('../../components/EmailInput/EmailInput', () => ({
  default: ({ 
    id, 
    label, 
    value, 
    onChange, 
    onBlur, 
    error, 
    required, 
    autoFocus 
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    error: string;
    required: boolean;
    autoFocus: boolean;
  }) => (
    <div data-testid="email-input">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="email"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        autoFocus={autoFocus}
        data-testid="email-field"
      />
      {error && <span id={`${id}-error`} className="error">{error}</span>}
    </div>
  ),
}));

vi.mock('../../components/Card/Card', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('email');
  });

  it('should render with proper accessibility and form structure', () => {
    renderWithRouter(<ForgotPasswordPage />);
    
    // Check all form elements are present
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
    
    // Check accessibility features
    checkFormAccessibility();
    
    // Check semantic structure
    const section = screen.getByRole('region');
    const heading = screen.getByRole('heading');
    expect(section).toHaveAttribute('aria-labelledby', 'forgot-heading');
    expect(heading).toHaveAttribute('id', 'forgot-heading');
  });

  it('should handle successful password reset flow', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);
    
    // Fill and submit form
    const { submitButton } = await fillForgotPasswordForm(user, 'test@example.com');
    
    await user.click(submitButton);
    
    // Check loading state
    checkLoadingState('Sending...');
    
    // Check success message
    await checkSuccessMessage('Password reset email sent! Redirecting to login...');
    
    // Check navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/credentials?email=test%40example.com');
    }, { timeout: 5000 });
  });

  it('should handle email not found error', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);
    
    // Fill and submit form with invalid email
    const { submitButton } = await fillForgotPasswordForm(user, 'invalid@example.com');
    
    await user.click(submitButton);
    
    // Check error message
    await checkErrorMessage('Email not found');
  });

  it('should handle server error', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);
    
    // Fill and submit form with server error email
    const { submitButton } = await fillForgotPasswordForm(user, 'error@example.com');
    
    await user.click(submitButton);
    
    // Check error message
    await checkErrorMessage('Server error');
  });

  it('should validate email field and show appropriate errors', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);
    
    const emailField = screen.getByTestId('email-field') as HTMLInputElement;
    
    // Test invalid email
    await user.type(emailField, 'invalid-email');
    await user.tab();
    
    // Wait for debounced validation
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    }, { timeout: 500 });
    
    // Test empty email
    await user.clear(emailField);
    await user.tab();
    
    // Wait for debounced validation
    await waitFor(() => {
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should prefill email when provided in URL parameters', () => {
    mockSearchParams.set('email', 'test@example.com');
    
    renderWithRouter(<ForgotPasswordPage />);
    
    const emailField = screen.getByTestId('email-field') as HTMLInputElement;
    expect(emailField.value).toBe('test@example.com');
  });

  it('should handle keyboard navigation and form submission', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);
    
    const emailField = screen.getByTestId('email-field') as HTMLInputElement;
    
    // Fill form using keyboard
    await user.type(emailField, 'test@example.com');
    await user.keyboard('{Enter}');
    
    // Check form was submitted
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should navigate back to credentials page when back button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);
    
    const backButton = screen.getByRole('button', { name: /back to login/i });
    await user.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/credentials');
  });

  it('should clear errors when form is resubmitted with valid data', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPasswordPage />);

    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    // Enter invalid email and wait for debounce validation
    await user.type(emailInput, 'invalid@example.com');
    await user.tab();
    await waitFor(() => expect(submitButton).toBeEnabled(), { timeout: 500 });

    // Submit with invalid email
    await user.click(submitButton);

    // Check error appears
    await checkErrorMessage('Email not found');

    // Clear the form and enter valid email
    await user.clear(emailInput);
    await user.type(emailInput, 'valid@example.com');
    await user.tab();
    
    // Wait for debounced validation to complete and form to be valid
    await waitFor(() => expect(submitButton).toBeEnabled(), { timeout: 500 });

    // Submit the form
    await user.click(submitButton);

    // Check error is cleared and success message appears
    await waitFor(() => {
      expect(screen.queryByText('Email not found')).not.toBeInTheDocument();
      expect(screen.getByText('Password reset email sent! Redirecting to login...')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle special characters in email parameter', () => {
    mockSearchParams.set('email', 'test+user@example.com');
    
    renderWithRouter(<ForgotPasswordPage />);
    
    const emailField = screen.getByTestId('email-field') as HTMLInputElement;
    expect(emailField.value).toBe('test+user@example.com');
  });
}); 