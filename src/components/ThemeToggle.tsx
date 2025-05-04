
import React from 'react';
import { Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  // No longer toggle functionality, just a static light mode button
  return (
    <button
      className="p-2 rounded-md hover:bg-secondary transition-colors"
      aria-label="Light Mode"
      disabled
    >
      <Sun size={20} className="text-accent" />
    </button>
  );
};

export default ThemeToggle;
