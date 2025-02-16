// src/components/ui/Select.js
import React from 'react';

const Select = ({ name, value, onChange, options, className = '', ...rest }) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`border p-2 rounded ${className}`}
      {...rest}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
