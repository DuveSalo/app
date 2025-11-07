
import React from 'react';

// Checkbox Component
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export const Checkbox: React.FC<CheckboxProps> = ({ label, id, ...props }) => {
  return (
    <div className="flex items-center mb-2">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        {...props}
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
        {label}
      </label>
    </div>
  );
};


