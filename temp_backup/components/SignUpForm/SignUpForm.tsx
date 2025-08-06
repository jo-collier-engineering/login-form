import { useState, useRef, useEffect, useCallback } from "react";
import EmailInput from "../EmailInput/EmailInput";
import PasswordInput from "../PasswordInput/PasswordInput";
import { validateEmail, validatePassword, validateConfirmPassword } from "../../utils/validation";
import './SignUpForm.scss';

interface SignUpFormProps {
  onSuccess?: () => void;
}

const fakeSignUpApi = async (email: string, password: string) => {
  await new Promise((res) => setTimeout(res, 800));
  
  if (email === "taken@example.com") {
    throw new Error("Email already in use");
  }

  if (email === "newuser@example.com" && password === "Password123!") {
    return { success: true, token: "mock-token" };
  }

  throw new Error("Server error");
};

function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false });
  
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Debounced validation functions
  const debouncedEmailValidation = useCallback(
    (emailValue: string) => {
      const error = validateEmail(emailValue);
      setEmailError(error);
    },
    []
  );

  const debouncedPasswordValidation = useCallback(
    (passwordValue: string) => {
      const error = validatePassword(passwordValue);
      setPasswordError(error);
    },
    []
  );

  const debouncedConfirmPasswordValidation = useCallback(
    (confirmPasswordValue: string, passwordValue: string) => {
      const error = validateConfirmPassword(confirmPasswordValue, passwordValue);
      setConfirmPasswordError(error);
    },
    []
  );

  // Update validation when values change
  useEffect(() => {
    if (touched.email) {
      debouncedEmailValidation(email);
    }
  }, [email, touched.email, debouncedEmailValidation]);

  useEffect(() => {
    if (touched.password) {
      debouncedPasswordValidation(password);
    }
  }, [password, touched.password, debouncedPasswordValidation]);

  useEffect(() => {
    if (touched.confirmPassword) {
      debouncedConfirmPasswordValidation(confirmPassword, password);
    }
  }, [confirmPassword, password, touched.confirmPassword, debouncedConfirmPasswordValidation]);

  const formValid = !emailError && !passwordError && !confirmPasswordError && email && password && confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true, confirmPassword: true });
    setError(null);

    if (!formValid) return;

    try {
      setLoading(true);
      const result = await fakeSignUpApi(email, password);
      
      if (result.success) {
        if (onSuccess) onSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      setTimeout(() => {
        errorRef.current?.focus();
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" role="form" noValidate onSubmit={handleSubmit}>
      <EmailInput
        id="signup-email"
        label="Email address"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
        error={emailError}
        required
        autoFocus
      />
      
      <PasswordInput
        id="signup-password"
        label="Password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
        error={passwordError}
      />
 
      <PasswordInput
        id="signup-confirm-password"
        label="Confirm password"
        value={confirmPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
        onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
        error={confirmPasswordError}
      />

      <div className="form__actions">
        <p
          id="login-error"
          ref={errorRef}
          role={error ? "alert" : undefined}
          className="form__error"
        >
          {error || "\u00A0"}
        </p>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={!formValid || loading}
          aria-describedby="signup-error"
        >
          {loading ? "Signing up…" : "Sign Up"}
        </button>
      </div>
    </form>
  );
};

export default SignUpForm; 