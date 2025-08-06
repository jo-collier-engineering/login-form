import './RememberMeCheckbox.scss';

interface RememberMeCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

function RememberMeCheckbox({
  id,
  checked,
  onChange,
  className = "",
}: RememberMeCheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <section className={`remember-me ${className}`.trim()}>
      <label className="remember-me__label">
        <input
          type="checkbox"
          name={id}
          checked={checked}
          onChange={handleChange}
          className="remember-me__checkbox"
          aria-describedby={`${id}-description`}
        />

        <span className="remember-me__text">Remember me</span>
      </label>
      <span id={`${id}-description`} className="remember-me__description">
        Stay logged in for 30 days
      </span>
    </section>
  );
}

export default RememberMeCheckbox; 