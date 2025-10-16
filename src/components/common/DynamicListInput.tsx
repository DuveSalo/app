
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

interface DynamicListInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  minItems?: number;
  addButtonLabel?: string;
}

export const DynamicListInput: React.FC<DynamicListInputProps> = ({
  label,
  items,
  onChange,
  placeholder = 'Escriba aquí...',
  minItems = 0,
  addButtonLabel
}) => {
  const addItem = () => {
    onChange([...items, '']);
  };

  const removeItem = (index: number) => {
    if (items.length > minItems) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              label=""
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`${placeholder} ${index + 1}`}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              disabled={items.length <= minItems}
              className="p-2 text-red-500 hover:bg-red-100 disabled:text-gray-400 disabled:bg-transparent"
              aria-label={`Remove item ${index + 1}`}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>{addButtonLabel || `Agregar ${label.toLowerCase()}`}</span>
        </Button>
      </div>
    </div>
  );
};


export default DynamicListInput;
