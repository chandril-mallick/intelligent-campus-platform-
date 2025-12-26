import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  className = '',
  disabled = false,
  required = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
            {icon}
          </div>
        )}
        
        <motion.input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-2.5 
            ${icon ? 'pl-10' : ''}
            border rounded-lg 
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:bg-secondary-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-error-500 focus:ring-error-500 focus:border-error-500' 
              : 'border-secondary-300 focus:ring-accent-500 focus:border-accent-500'
            }
            ${isFocused && !error ? 'shadow-glow' : ''}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-error-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
