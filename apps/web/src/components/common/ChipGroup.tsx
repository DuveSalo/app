import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  'flex items-center justify-center h-7 rounded-lg px-3 text-xs font-medium border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/10',
  {
    variants: {
      isSelected: {
        true: 'bg-primary border-primary text-primary-foreground',
        false: 'bg-background border-border text-foreground hover:bg-accent',
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

const Chip = ({ label, isSelected, onSelect, disabled }: ChipProps) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    className={cn(chipVariants({ isSelected }), disabled && 'opacity-50 cursor-not-allowed')}
  >
    {isSelected && <Check className="w-3 h-3 mr-1.5" strokeWidth={2.5} />}
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

export const ChipGroup = ({
  options,
  selectedOptions,
  onChange,
  label,
  disabled,
  className,
}: ChipGroupProps) => {
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
      {label && <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-1.5">
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
