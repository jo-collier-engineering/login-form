import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CredentialsPage from './CredentialsPage';
import { 
  mockValidation, 
  mockCookies, 
  createRouterMocks, 
  renderWithRouter,
  checkFormAccessibility,
  checkValidationErrors,
  checkLoadingState,
  checkErrorMessage
} from '../../test-utils';

// Setup mocks
mockValidation();
mockCookies();
const { mockNavigate } = createRouterMocks();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

describe('CredentialsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with proper accessibility and form structure', () => {
    renderWithRouter(<CredentialsPage />);
    
    // Check all form elements are present
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    const loginButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Login') && button.getAttribute('type') === 'submit'
    );
    expect(loginButtons.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    
    // Check accessibility features
    checkFormAccessibility();
  });

  it('should handle successful login flow', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CredentialsPage />);
    
    // Fill and submit login form
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const inputs = screen.getAllByDisplayValue('');
    const passwordInput = inputs.find(input => input.getAttribute('type') === 'password') as HTMLInputElement;
    const loginButton = screen.getAllByRole('button').find(button => button.textContent?.includes('Login') && button.getAttribute('type') === 'submit') as HTMLButtonElement;
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(loginButton);
    
    // Check loading state
    checkLoadingState('Logging in…');
    
    // Check success navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 2000 });
  });

  it('should handle login failure with proper error display', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CredentialsPage />);
    
    // Fill and submit form with wrong credentials
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getAllByDisplayValue('').find(input => input.getAttribute('type') === 'password') as HTMLInputElement;
    const loginButton = screen.getAllByRole('button').find(button => button.textContent?.includes('Login') && button.getAttribute('type') === 'submit') as HTMLButtonElement;
    
    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'WrongPassword123!');
    await user.click(loginButton);
    
    // Check error message
    await checkErrorMessage('Invalid email or password');
  });

  it('should validate form fields and show appropriate errors', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CredentialsPage />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getAllByDisplayValue('').find(input => input.getAttribute('type') === 'password') as HTMLInputElement;
    
    // Focus and blur fields to trigger validation
    await user.click(emailInput);
    await user.tab();
    await user.click(passwordInput);
    await user.tab();
    
    // Check validation errors
    await checkValidationErrors(['Email is required.', 'Password is required.']);
  });

  it('should handle remember me functionality', async () => {
    const user = userEvent.setup();
    
    // Use vi.spyOn instead of module-level mocks
    const cookiesModule = await import('../../utils/cookies');
    const setRememberMeTokenSpy = vi.spyOn(cookiesModule, 'setRememberMeToken');
    const setRememberMePreferenceSpy = vi.spyOn(cookiesModule, 'setRememberMePreference');
    
    renderWithRouter(<CredentialsPage />);
    
    // Fill form with remember me checked
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getAllByDisplayValue('').find(input => input.getAttribute('type') === 'password') as HTMLInputElement;
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    const loginButton = screen.getAllByRole('button').find(button => button.textContent?.includes('Login') && button.getAttribute('type') === 'submit') as HTMLButtonElement;
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(rememberMeCheckbox);
    await user.click(loginButton);
    
    // Check remember me preferences are saved
    await waitFor(() => {
      expect(setRememberMeTokenSpy).toHaveBeenCalledWith('mock-token');
      expect(setRememberMePreferenceSpy).toHaveBeenCalledWith(true);
    }, { timeout: 2000 });
  });

  it('should handle keyboard navigation and form submission', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CredentialsPage />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getAllByDisplayValue('').find(input => input.getAttribute('type') === 'password') as HTMLInputElement;
    
    // Fill form using keyboard
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.keyboard('{Enter}');
    
    // Check form was submitted
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 2000 });
  });

  it('should switch to signup mode when signup button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CredentialsPage />);
    
    const signupButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(signupButton);
    
    // Check that the heading changes to "Sign Up"
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    
    // Check that the signup form is now visible
    const submitButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Sign Up') && button.getAttribute('type') === 'submit'
    );
    expect(submitButtons.length).toBeGreaterThan(0);
  });

  it('should have forgot password link with correct href', () => {
    renderWithRouter(<CredentialsPage />);
    
    const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  it('should prefill email when provided in URL parameters', async () => {
    // Mock useSearchParams to return the email parameter
    const mockSearchParams = new URLSearchParams('email=test@example.com');
    const mockSetSearchParams = vi.fn();
    
    // Use dynamic import and vi.spyOn
    const reactRouterDom = await import('react-router-dom');
    vi.spyOn(reactRouterDom, 'useSearchParams').mockReturnValue([mockSearchParams, mockSetSearchParams]);
    
    renderWithRouter(<CredentialsPage />);
    
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    
    await waitFor(() => {
      expect(emailInput).toHaveValue('test@example.com');
    }, { timeout: 2000 });
  });

  it('should handle session resume when remember me token exists', async () => {
    // Use vi.spyOn instead of module-level mocks
    const cookiesModule = await import('../../utils/cookies');
    const getRememberMeTokenSpy = vi.spyOn(cookiesModule, 'getRememberMeToken');
    getRememberMeTokenSpy.mockReturnValue('mock-token');
    
    renderWithRouter(<CredentialsPage />);
    
    // Check session resume is attempted
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 2000 });
  });

  it('should clear errors when form is resubmitted with valid data', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CredentialsPage />);
    
    // First submission with wrong credentials
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getAllByDisplayValue('').find(input => input.getAttribute('type') === 'password') as HTMLInputElement;
    const loginButton = screen.getAllByRole('button').find(button => button.textContent?.includes('Login') && button.getAttribute('type') === 'submit') as HTMLButtonElement;
    
    await user.clear(emailInput);
    await user.type(emailInput, 'wrong@example.com');
    await user.tab(); // Trigger validation
    await user.type(passwordInput, 'WrongPassword123!');
    await user.click(loginButton);

    await waitFor(async() => {
      await checkErrorMessage('Invalid email or password');
    }, { timeout: 2000 });
    
    // Resubmit with correct credentials
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'user@example.com');
    
    await waitFor(async () => {
      await user.type(passwordInput, 'Password123!');
      expect(loginButton).not.toHaveAttribute('disabled');
      await user.click(loginButton);
    }, { timeout: 2000 });

    
    // Check error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });
}); 