// src/components/ui/textarea.js
import React from 'react'

const Textarea = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}

export { Textarea }
