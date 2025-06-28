import React from 'react';
import { FormTheme } from '../types';

interface ProgressBarProps {
  progress: number;
  theme: FormTheme;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, theme }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-700">
      <div
        className="h-full bg-white transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};