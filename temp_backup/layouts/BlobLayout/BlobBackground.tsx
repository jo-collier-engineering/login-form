import './BlobBackground.scss';

interface BlobBackgroundProps {
  className?: string;
  isAnimating?: boolean;
}

const BlobBackground = ({ className, isAnimating = true }: BlobBackgroundProps) => {
  return (
    <div 
      data-testid="blob-background"
      className={`gradient-bg ${className || ''} ${!isAnimating ? 'gradient-bg--paused' : ''}`}
    >
      <div className="gradients-container">
        <div className="g1"></div>
        <div className="g2"></div>
        <div className="g3"></div>
        <div className="g4"></div>
        <div className="g5"></div>
      </div>
    </div>
  );
};

export default BlobBackground; 