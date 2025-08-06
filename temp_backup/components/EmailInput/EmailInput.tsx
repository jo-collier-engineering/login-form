import './EmailInput.scss';

interface EmailInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  autoFocus?: boolean;
  describedBy?: string;
}


function EmailInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  autoFocus = false,
  describedBy,
}: EmailInputProps) {
  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedBy = [describedBy, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <section className="form-group">
      <label htmlFor={id} className="form-group__label">
        {label}
        
        {required && <span aria-hidden="true">*</span>}
      </label>

      <input
        type="email"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        autoFocus={autoFocus}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
        autoComplete="email"
        inputMode="email"
        className="form-group__input"
      />
      
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

export default EmailInput; 