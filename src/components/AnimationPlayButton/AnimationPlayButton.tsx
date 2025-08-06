import './AnimationPlayButton.scss';

interface AnimationPlayButtonProps {
  isAnimating: boolean;
  onToggle: () => void;
}

const AnimationPlayButton = ({ 
  isAnimating, 
  onToggle 
}: AnimationPlayButtonProps) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      className="animation-toggle"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-label={isAnimating ? 'Turn off animations' : 'Turn on animations'}
      title={isAnimating ? 'Turn off animations' : 'Turn on animations'}
    >
      <svg
        className="animation-toggle__icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {isAnimating ? (
          // Pause icon when animations are on
          <>
            <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
            <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
          </>
        ) : (
          // Play icon when animations are off
          <path
            d="M8 5v14l11-7z"
            fill="currentColor"
          />
        )}
      </svg>
    </button>
  );
};

export default AnimationPlayButton; 