import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmailInput from "../../components/EmailInput/EmailInput";
import { validateEmail } from "../../utils/validation";
import Card from "../../components/Card/Card";
import './ForgotPasswordPage.scss';

const fakeForgotPasswordApi = async (email: string) => {
  await new Promise((res) => setTimeout(res, 800));
  if (email === "invalid@example.com") {
    throw new Error("Email not found");
  }
  if (email === "error@example.com") {
    throw new Error("Server error");
  }
  return { success: true };
};

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false });
  const [formValid, setFormValid] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
 
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
 
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Debounced validation function
  const debouncedEmailValidation = useCallback(
    (emailValue: string) => {
      const error = validateEmail(emailValue);
      setEmailError(error);
      setFormValid(!error);
    },
    []
  );

  // Update validation when email changes
  useEffect(() => {
    if (touched.email) {
      debouncedEmailValidation(email);
    }
  }, [email, touched.email, debouncedEmailValidation]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setTouched({ email: true });
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true });
    setError(null);

    if (!formValid) return;
    setLoading(true);

    try {
      const response = await fakeForgotPasswordApi(email);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/credentials?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed");
      setTimeout(() => {
        errorRef.current?.focus();
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleOnChange = (value: string) => {
    setEmail(value);
    setTouched(prev => ({ ...prev, email: true }));
    debouncedEmailValidation(value);
  };

  return (
    <Card className="auth-card">  
      <section className="auth-card__section" aria-labelledby="forgot-heading">
        <header>
          <h1 id="forgot-heading">Forgot Password</h1>
        </header>

        <form className="form" role="form" noValidate onSubmit={handleSubmit}>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
          
          <EmailInput
            id="forgot-email"
            label="Email address"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOnChange(e.target.value)}   
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            error={emailError}
            required
            autoFocus
          />
          
          {error && (
            <p
              id="forgot-error"
              ref={errorRef}
              role="alert"
              className="form__error"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              id="forgot-success"
              role="status"
              aria-live="polite"
              className="form__success"
            >
              Password reset email sent! Redirecting to login...
            </p>
          )}

          <p className="form__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!formValid || loading }
              aria-busy={loading || success}
              aria-describedby="forgot-error forgot-success"
              >
              {loading ? "Sending..." : "Reset Password"}
            </button>
            
            <button
              type="button"
              className="btn btn--link"
              onClick={() => navigate("/credentials")}
            >
              Back to Login
            </button>
          </p>
        </form>
      </section>
    </Card>
  );
};

export default ForgotPasswordPage; 