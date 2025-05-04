
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-card shadow-md rounded-lg overflow-hidden border border-border">
      <div className="px-6 py-4 bg-secondary">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
