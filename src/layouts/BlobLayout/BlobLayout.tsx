import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BlobBackground from './BlobBackground';
import AnimationPlayButton from '../../components/AnimationPlayButton/AnimationPlayButton';
import './BlobLayout.scss';

const BlobLayout = () => {
  const [isAnimating, setIsAnimating] = useState(true);

  const handleToggleAnimation = () => {
    setIsAnimating(prev => !prev);
  };

  return (
    <div className="layout">
      <BlobBackground className="layout__background" isAnimating={isAnimating} />
      <main className="layout__content">
        <Outlet />
      </main>
      <AnimationPlayButton 
        isAnimating={isAnimating} 
        onToggle={handleToggleAnimation} 
      />
    </div>
  );
};

export default BlobLayout;