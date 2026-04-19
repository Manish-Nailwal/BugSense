import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white dark:bg-zinc-900 
      border border-zinc-200 dark:border-transparent 
      rounded-2xl p-6 transition-all duration-300
      shadow-sm dark:shadow-none
      ${hover ? 'hover:shadow-xl dark:hover:bg-zinc-800/80 hover:-translate-y-1' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;

