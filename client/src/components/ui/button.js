// src/components/ui/button.js
import React from 'react'

const Button = ({ children, className = '', variant, ...props }) => {
  const baseClass = "px-4 py-2 rounded focus:outline-none transition duration-200"
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-50"
  }
  const variantClass = variants[variant] || variants.primary

  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  )
}

export { Button }
