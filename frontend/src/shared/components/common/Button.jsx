import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  type = 'button',
  ...props 
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 cursor-pointer border-none';
  
  // Variant styles with proper Tailwind-like classes
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-2xl hover:scale-105 rounded-xl px-6 py-3',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 rounded-xl px-6 py-3 border-2 border-gray-300 hover:border-blue-500',
    outline: 'bg-transparent text-blue-600 hover:bg-blue-50 rounded-xl px-6 py-3 border-2 border-blue-600 hover:border-blue-700',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:scale-105 rounded-xl px-6 py-3',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105 rounded-xl px-6 py-3',
    white: 'bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:scale-105 rounded-xl px-6 py-3',
  };
  
  const variantStyles = variants[variant] || variants.primary;
  
  return (
    <button 
      type={type}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};