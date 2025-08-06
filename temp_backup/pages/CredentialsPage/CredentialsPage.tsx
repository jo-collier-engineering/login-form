import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "../../components/LoginForm/LoginForm";
import SignUpForm from "../../components/SignUpForm/SignUpForm";
import ToggleButton from "../../components/ToggleButton/ToggleButton";
import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import './CredentialsPage.scss';

type Mode = "login" | "signup";

interface ToggleOption {
  value: string;
  label: string;
  ariaLabel: string;
}

const toggleOptions: ToggleOption[] = [
  { value: "login", label: "Login", ariaLabel: "Show login form" },
  { value: "signup", label: "Sign Up", ariaLabel: "Show sign up form" },
];

const CredentialsPage = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [prefilledEmail, setPrefilledEmail] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setPrefilledEmail(emailParam);
      setMode("login");
    }
  }, [searchParams]);

  const handleSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <Card className="auth-card">
      <section className="auth-card__section" aria-labelledby="credentials-heading">
        <header>
          <h1 id="credentials-heading">
            {mode === "login" ? "Login" : "Sign Up"}
          </h1>
        </header>

        <ToggleButton
          options={toggleOptions}
          value={mode}
          onChange={v => setMode(v as Mode)}
        />

        {mode === "login" ? (
          <LoginForm onSuccess={handleSuccess} prefilledEmail={prefilledEmail} />
        ) : (
          <SignUpForm onSuccess={handleSuccess} />
        )}

        <div className="form__actions">
          <Link to="/forgot-password" className="btn btn--link">
            Forgot Password?
          </Link>
        </div>
      </section>
    </Card>
  );
};

export default CredentialsPage; 