// src/components/ui/input.js
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ type, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative w-full">
      <input
        type={isPassword && showPassword ? 'text' : type}
        className={`px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
};

export { Input };
