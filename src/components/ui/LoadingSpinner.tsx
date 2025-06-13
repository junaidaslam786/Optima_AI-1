// components/ui/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
  );
};

export default LoadingSpinner;