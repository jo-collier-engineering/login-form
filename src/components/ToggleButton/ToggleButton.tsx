import './ToggleButton.scss';

interface ToggleOption {
  value: string;
  label: string;
  ariaLabel: string;
}

interface ToggleButtonProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function ToggleButton({ 
  options, 
  value, 
  onChange, 
  className = "" 
}: ToggleButtonProps) {
  return (
    <div
      role="group"
      aria-label="Toggle buttons"
      className={`toggle-button ${className}`.trim()}
    >
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.value)}
          className={`toggle-button__button ${value === option.value ? "selected" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default ToggleButton; 