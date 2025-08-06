import { useLayoutEffect, useRef, useState } from "react";
import './PasswordInput.scss';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  autoFocus?: boolean;
  describedBy?: string;
  showToggle?: boolean;
  onShowToggle?: (show: boolean) => void;
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  describedBy,
  onShowToggle,
  autoFocus = false,
  showToggle = true,
}: PasswordInputProps) {
  const toggleClickedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [show, setShow] = useState(false);

  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedBy = [describedBy, errorId].filter(Boolean).join(" ") || undefined;
  
  const handleToggle = () => {
    toggleClickedRef.current = true;
    setShow((prev) => {
      const showPassword = !prev;
      if (onShowToggle) onShowToggle(showPassword);
      return showPassword;
    });
  };

  useLayoutEffect(() => {
    if (toggleClickedRef.current && inputRef.current) {
      inputRef.current.focus();
      toggleClickedRef.current = false;
    }
  }, [show]);

  return (
    <section className="form-group">
      <label htmlFor={id} className="form-group__label">
        {label}
        <span aria-hidden="true">*</span>
      </label>

      <div className="password-input">
        <input
          type={show ? "text" : "password"}
          id={id}
          ref={inputRef}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy}
          autoComplete={id.toLowerCase().includes("confirm") ? "new-password" : "current-password"}
          required
          className="form-group__input password-input__input"
        />

        {showToggle && (
          <button
            type="button"
            onClick={handleToggle}
            aria-pressed={show}
            aria-label={show ? "Hide password" : "Show password"}
            className="password-input__toggle"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>

      <p
        id={errorId}
        role={error ? "alert" : undefined}
        className="form-group__error"
      >
        {error || "\u00A0"}
      </p>
    </section>
  );
}

export default PasswordInput; 