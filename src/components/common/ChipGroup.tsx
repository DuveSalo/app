
import React from 'react';
import { cva } from 'cva';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

const chipVariants = cva(
  'flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md transition-all duration-200',
  {
    variants: {
      isSelected: {
        true: 'bg-blue-100 border-blue-500 text-blue-700',
        false: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
      },
    },
  }
);

const Chip: React.FC<{
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ label, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={clsx(chipVariants({ isSelected }))}
  >
    {isSelected && <Check className="w-4 h-4 mr-2" />}
    {label}
  </button>
);

interface ChipGroupProps {
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({ 
  options, 
  selectedOptions, 
  onChange, 
  label 
}) => {
  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter(item => item !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            isSelected={selectedOptions.includes(option)}
            onSelect={() => toggleOption(option)}
          />
        ))}
      </div>
    </div>
  );
};


