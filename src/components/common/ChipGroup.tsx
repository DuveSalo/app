import React from 'react';
import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  'flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:ring-offset-2',
  {
    variants: {
      isSelected: {
        true: 'bg-gray-900 border-gray-900 text-white',
        false: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
      },
    },
  }
);

interface ChipProps {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({ label, isSelected, onSelect, disabled }) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    className={cn(
      chipVariants({ isSelected }),
      disabled && 'opacity-50 cursor-not-allowed'
    )}
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
  disabled?: boolean;
  className?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  options,
  selectedOptions,
  onChange,
  label,
  disabled,
  className,
}) => {
  const toggleOption = (option: string) => {
    if (disabled) return;
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((item) => item !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  return (
    <div className={cn('w-full', className)}>
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
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};
