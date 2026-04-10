import React from 'react';
import './SkeletonLoader.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'bento';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className = '',
  variant = 'rect'
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: borderRadius,
  };

  return (
    <div 
      className={`skeleton-loader ${variant} ${className}`} 
      style={style}
      aria-hidden="true"
      role="presentation"
    />
  );
};

export const BentoSkeleton: React.FC = () => (
  <div className="bento-grid">
    <SkeletonLoader variant="bento" className="large" />
    <SkeletonLoader variant="bento" className="tall" />
    <SkeletonLoader variant="bento" />
    <SkeletonLoader variant="bento" />
    <SkeletonLoader variant="bento" className="large" />
    <SkeletonLoader variant="bento" />
    <SkeletonLoader variant="bento" />
  </div>
);

export const WorkCardSkeleton: React.FC = () => (
  <div className="gallery-item skeleton-variant">
    <SkeletonLoader height="100%" width="100%" className="gallery-visual" />
    <div className="gallery-info">
      <SkeletonLoader width="40%" height="12px" className="mb-2" />
      <SkeletonLoader width="80%" height="24px" className="mb-4" />
      <SkeletonLoader width="100%" height="40px" />
    </div>
  </div>
);
