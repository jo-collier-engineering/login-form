import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Mock the validation functions
export const mockValidation = () => {
  vi.mock('../utils/validation', () => ({
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
    validateConfirmPassword: vi.fn((confirmPassword: string, password: string) => {
      if (!confirmPassword) return 'Please confirm your password.';
      if (confirmPassword !== password) return 'Passwords do not match.';
      return '';
    }),
  }));
};

// Mock the cookies utilities
export const mockCookies = () => {
  vi.mock('../utils/cookies', () => ({
    setRememberMeToken: vi.fn(),
    setRememberMePreference: vi.fn(),
    getRememberMePreference: vi.fn(() => false),
    getRememberMeToken: vi.fn(() => null),
    removeRememberMeToken: vi.fn(),
  }));
};

// Create mock functions for router
export const createRouterMocks = () => {
  const mockNavigate = vi.fn();
  const mockSearchParams = new URLSearchParams();

  return { mockNavigate, mockSearchParams };
};

// Helper to render with router
export const renderWithRouter = (
  component: React.ReactElement, 
  initialEntries: string[] = ['/']
) => {
  return render(
    React.createElement(MemoryRouter, { initialEntries }, component)
  );
};

// Helper to fill login form
export const fillLoginForm = async (user: ReturnType<typeof userEvent.setup>, credentials: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  const emailInput = screen.getByRole('textbox', { name: /email address/i });
  const passwordInput = screen.getAllByDisplayValue('').find(input => input.getAttribute('type') === 'password') as HTMLInputElement;
  const submitButton = screen.getByRole('button', { name: /login/i });

  await user.type(emailInput, credentials.email);
  await user.type(passwordInput, credentials.password);

  if (credentials.rememberMe) {
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    await user.click(rememberMeCheckbox);
  }

  return { emailInput, passwordInput, submitButton };
};

// Helper to fill signup form
export const fillSignupForm = async (user: ReturnType<typeof userEvent.setup>, credentials: {
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const emailInput = screen.getByRole('textbox', { name: /email address/i });
  const inputs = screen.getAllByDisplayValue('');
  const passwordInput = inputs[1];
  const confirmPasswordInput = inputs[2];
  const submitButton = screen.getByRole('button', { name: /sign up/i });

  await user.type(emailInput, credentials.email);
  await user.type(passwordInput, credentials.password);
  await user.type(confirmPasswordInput, credentials.confirmPassword);

  return { emailInput, passwordInput, confirmPasswordInput, submitButton };
};

// Helper to fill forgot password form
export const fillForgotPasswordForm = async (user: ReturnType<typeof userEvent.setup>, email: string) => {
  const emailInput = screen.getByRole('textbox', { name: /email address/i });
  const submitButton = screen.getByRole('button', { name: /reset password/i });

  await user.type(emailInput, email);
  await user.tab();

  // Wait for debounced validation to complete
  await waitFor(() => {
    expect(submitButton).toBeEnabled();
  }, { timeout: 500 });

  return { emailInput, submitButton };
};

// Helper to check form validation errors
export const checkValidationErrors = async (expectedErrors: string[]) => {
  await waitFor(() => {
    expectedErrors.forEach(error => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });
};

// Helper to check form is accessible
export const checkFormAccessibility = () => {
  // Check form has proper role
  const form = screen.getByRole('form');
  expect(form).toHaveAttribute('novalidate');

  // Check required fields have proper attributes
  const requiredInputs = screen.getAllByDisplayValue('').filter(input => 
    input.hasAttribute('required')
  );
  expect(requiredInputs.length).toBeGreaterThan(0);

  // Check submit button exists and is initially disabled
  const submitButtons = screen.getAllByRole('button').filter(button => 
    /(login|sign up|reset password)/i.test(button.textContent || '') && button.getAttribute('type') === 'submit'
  );
  expect(submitButtons.length).toBeGreaterThan(0);
  expect(submitButtons[0]).toBeDisabled();
};

// Helper to check loading state
export const checkLoadingState = (buttonText: string) => {
  const submitButtons = screen.getAllByRole('button').filter(button => 
    new RegExp(buttonText, 'i').test(button.textContent || '') && button.getAttribute('type') === 'submit'
  );
  expect(submitButtons.length).toBeGreaterThan(0);
  expect(submitButtons[0]).toHaveTextContent(buttonText);
  expect(submitButtons[0]).toBeDisabled();
};

// Helper to check error message
export const checkErrorMessage = async (expectedError: string) => {
  await waitFor(() => {
    const errorElement = screen.getByText(expectedError);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('role', 'alert');
  });
};

// Helper to check success message
export const checkSuccessMessage = async (expectedMessage: string) => {
  await waitFor(() => {
    const successElement = screen.getByText(expectedMessage);
    expect(successElement).toBeInTheDocument();
    expect(successElement).toHaveAttribute('role', 'status');
  });
}; 