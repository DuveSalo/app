
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
}
export const Select: React.FC<SelectProps> = ({ label, id, error, options, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-content-muted mb-1">{label}</label>
    <select
      id={id}
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-borderClr'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface text-content`}
      {...props}
    >
      <option value="">Seleccione...</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default Select;
