import React from 'react';

interface UserSilhouetteProps {
  size?: number;
  className?: string;
}

export const UserSilhouette: React.FC<UserSilhouetteProps> = ({ size = 64, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Glow Aura */}
      <circle cx="50" cy="50" r="46" fill="rgba(212, 175, 55, 0.08)" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
      
      {/* Hero Silhouette Body */}
      <path 
        d="M50 20C40.6 20 33 27.6 33 37C33 44.5 37.9 50.8 44.6 53.1C28.8 56.6 17 70.6 17 87.5C17 88.9 18.1 90 19.5 90H80.5C81.9 90 83 88.9 83 87.5C83 70.6 71.2 56.6 55.4 53.1C62.1 50.8 67 44.5 67 37C67 27.6 59.4 20 50 20Z" 
        fill="currentColor" 
        opacity="0.85"
      />
      
      {/* Hero Crown / Crest */}
      <path 
        d="M44 24L50 17L56 24L62 19L58 29H42L38 19L44 24Z" 
        fill="#f59e0b" 
      />
    </svg>
  );
};
