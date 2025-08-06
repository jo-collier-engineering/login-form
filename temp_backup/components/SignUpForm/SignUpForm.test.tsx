import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUpForm from './SignUpForm';
import { 
  mockValidation, 
  fillSignupForm, 
  checkFormAccessibility,
  checkValidationErrors,
  checkLoadingState,
  checkErrorMessage
} from '../../test-utils';

// Setup mocks
mockValidation();

describe('SignUpForm', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with proper accessibility and form structure', () => {
    render(<SignUpForm {...defaultProps} />);
    
    // Check all form elements are present
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    const inputs = screen.getAllByDisplayValue('');
    expect(inputs[1]).toBeInTheDocument(); // Password input
    expect(inputs[2]).toBeInTheDocument(); // Confirm password input
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    
    // Check accessibility features
    checkFormAccessibility();
    
    // Check auto-focus on email
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    expect(emailInput).toHaveFocus();
  });

  it('should handle successful signup flow', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<SignUpForm {...defaultProps} onSuccess={onSuccess} />);
    
    // Fill and submit form
    const { submitButton } = await fillSignupForm(user, {
      email: 'newuser@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    
    await user.click(submitButton);
    
    // Check loading state
    checkLoadingState('Signing up…');
    
    // Check success callback
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should handle signup failure with proper error display', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);
    
    // Fill and submit form with taken email
    const { submitButton } = await fillSignupForm(user, {
      email: 'taken@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    
    await user.click(submitButton);
    
    // Check error message
    await checkErrorMessage('Email already in use');
  });

  it('should validate form fields and show appropriate errors', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const inputs = screen.getAllByDisplayValue('');
    const passwordInput = inputs[1];
    const confirmPasswordInput = inputs[2];
    
    // Focus and blur fields to trigger validation
    await user.click(emailInput);
    await user.tab();
    await user.click(passwordInput);
    await user.tab();
    await user.click(confirmPasswordInput);
    await user.tab();
    
    // Check validation errors
    await checkValidationErrors([
      'Email is required.',
      'Password is required.',
      'Please confirm your password.'
    ]);
  });

  it('should validate password confirmation matching', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const inputs = screen.getAllByDisplayValue('');
    const passwordInput = inputs[1];
    const confirmPasswordInput = inputs[2];
    
    // Fill with mismatched passwords
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'DifferentPassword123!');
    await user.tab();
    
    // Check password mismatch error
    await checkValidationErrors(['Passwords do not match.']);
  });

  it('should handle keyboard navigation and form submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<SignUpForm {...defaultProps} onSuccess={onSuccess} />);
    
    const inputs = screen.getAllByDisplayValue('');
    const emailInput = inputs[0];
    const passwordInput = inputs[1];
    const confirmPasswordInput = inputs[2];
    
    // Fill form using keyboard
    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    await user.keyboard('{Enter}');
    
    // Check form was submitted
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should handle password visibility toggles', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);
    
    const passwordInputs = screen.getAllByDisplayValue('');
    const passwordInput = passwordInputs[1];
    const confirmPasswordInput = passwordInputs[2];
    const passwordToggles = screen.getAllByRole('button', { name: /show password/i });
    
    // Initially both should be password type
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Toggle password visibility
    await user.click(passwordToggles[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Toggle confirm password visibility
    await user.click(passwordToggles[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('should clear errors when form is resubmitted with valid data', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);
    
    // First submission with taken email
    const { submitButton } = await fillSignupForm(user, {
      email: 'taken@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    
    await user.click(submitButton);
    
    // Check error appears
    await checkErrorMessage('Email already in use');
    
    // Resubmit with valid email
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    await user.clear(emailInput);
    await user.type(emailInput, 'newuser@example.com');
    await user.click(submitButton);
    
    // Check error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Email already in use')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle server errors gracefully', async () => {
    const user = userEvent.setup();
    render(<SignUpForm {...defaultProps} />);
    
    // Fill and submit form with server error email
    const { submitButton } = await fillSignupForm(user, {
      email: 'other@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    
    await user.click(submitButton);
    
    // Check server error message
    await checkErrorMessage('Server error');
  });
}); 