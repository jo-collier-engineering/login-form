import { useState, useRef, useEffect, useCallback } from "react";

import './LoginForm.scss';
import EmailInput from "../EmailInput/EmailInput";
import PasswordInput from "../PasswordInput/PasswordInput";
import RememberMeCheckbox from "../RememberMeCheckbox/RememberMeCheckbox";
import { validateEmail, validatePassword } from "../../utils/validation";
import { setRememberMeToken, setRememberMePreference, getRememberMePreference, getRememberMeToken, removeRememberMeToken } from "../../utils/cookies";

interface LoginFormProps {
  onSuccess: () => void;
  prefilledEmail?: string;
}

const fakeLoginApi = async (email: string, password: string) => {
  await new Promise((res) => setTimeout(res, 800));
  
  if (email === "user@example.com" && password === "Password123!") {
    return { success: true, token: "mock-token" };
  }

  throw new Error("Invalid email or password");
};

const fakeResumeSessionApi = async (token: string) => {
  await new Promise((res) => setTimeout(res, 800));

  if (token === "mock-token") {
    return { success: true };
  }

  throw new Error("Invalid or expired token");
};

function LoginForm({ onSuccess, prefilledEmail = "" }: LoginFormProps) {
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
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
    const savedPreference = getRememberMePreference();
    setRememberMe(savedPreference);
    
    const savedToken = getRememberMeToken()
    if (savedToken) {
      const resumeSession = async(token: string) => {
        try {
          const result = await fakeResumeSessionApi(token)
          if (result.success) onSuccess();
        } catch {
          removeRememberMeToken()
        }
      }
      resumeSession(savedToken);
    }
  }, [onSuccess]);

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
      setTouched(prev => ({ ...prev, email: true }));
    }
  }, [prefilledEmail]);

  const formValid = !emailError && !passwordError && email && password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    setError(null);

    if (!formValid) return;

    setLoading(true);

    try {
      const result = await fakeLoginApi(email, password);

      if (result.success) {
        if (rememberMe) {
          setRememberMeToken(result.token);
          setRememberMePreference(true);
        } else {
          setRememberMePreference(false);
        }

        onSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      
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
          id="login-email"
          label="Email address"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          onBlur={() => setTouched(prevValue => ({ ...prevValue, email: true }))}
          error={emailError}
          required
          autoFocus
        />

        <PasswordInput
          id="login-password"
          label="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          onBlur={() => setTouched(prevValue => ({ ...prevValue, password: true }))}
          error={passwordError}
        />

        <RememberMeCheckbox
          id="login-remember-me"
          checked={rememberMe}
          onChange={setRememberMe}
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
            aria-describedby="login-error"
            disabled={!formValid || loading}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </div>
      </form>
      
  );
};

export default LoginForm; 