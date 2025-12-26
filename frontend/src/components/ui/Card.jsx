import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  gradient = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variants = {
    default: 'bg-white border border-secondary-200 shadow-soft',
    glass: 'glass shadow-medium',
    gradient: 'bg-gradient-to-br from-white to-secondary-50 border border-secondary-200 shadow-medium',
    dark: 'bg-secondary-900 text-white border border-secondary-700 shadow-medium',
  };
  
  const hoverClasses = hover ? 'hover:shadow-medium hover:-translate-y-1 cursor-pointer' : '';
  const gradientBorder = gradient ? 'gradient-border' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${hoverClasses} ${gradientBorder} ${className}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-secondary-200 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-secondary-200 ${className}`}>
    {children}
  </div>
);

export default Card;
