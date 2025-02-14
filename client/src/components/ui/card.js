// src/components/ui/card.js
import React from 'react';

// Card: মূল কার্ড কন্টেইনার
const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      {children}
    </div>
  );
};

// CardHeader: কার্ডের হেডার অংশ, যা সাধারণত শিরোনাম বা হেডার কন্টেন্ট ধারণ করে
const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`border-b pb-2 mb-2 ${className}`}>
      {children}
    </div>
  );
};

// CardTitle: কার্ডের শিরোনাম অংশ
const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold ${className}`}>
      {children}
    </h3>
  );
};

// CardContent: কার্ডের মূল বিষয়বস্তু ধারণ করে
const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent };
