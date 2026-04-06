import { useState, useEffect } from 'react';
import type { LifestyleGoalValue } from '../../../types/dietaryGoals';

interface LifestyleGoalFormProps {
  value?: LifestyleGoalValue;
  onChange: (value: LifestyleGoalValue) => void;
}

export function LifestyleGoalForm({ value, onChange }: LifestyleGoalFormProps) {
  const [lifestyleType, setLifestyleType] = useState<LifestyleGoalValue['lifestyleType']>(
    value?.lifestyleType || 'vegetarian'
  );
  const [strictness, setStrictness] = useState<'strict' | 'flexible'>(
    value?.strictness || 'flexible'
  );
  const [customName, setCustomName] = useState(value?.customName || '');

  useEffect(() => {
    onChange({
      lifestyleType,
      strictness,
      ...(lifestyleType === 'other' && customName ? { customName } : {}),
    });
  }, [lifestyleType, strictness, customName]);

  const lifestyleOptions = [
    { value: 'vegan', label: 'Vegan', description: 'No animal products' },
    { value: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
    { value: 'pescatarian', label: 'Pescatarian', description: 'No meat, but fish allowed' },
    { value: 'keto', label: 'Keto', description: 'Very low carb, high fat' },
    { value: 'paleo', label: 'Paleo', description: 'Whole foods, no grains or dairy' },
    { value: 'mediterranean', label: 'Mediterranean', description: 'Fish, vegetables, olive oil' },
    { value: 'low-carb', label: 'Low-Carb', description: 'Reduced carbohydrate intake' },
    { value: 'low-fat', label: 'Low-Fat', description: 'Reduced fat intake' },
    { value: 'gluten-free', label: 'Gluten-Free', description: 'No wheat or gluten' },
    { value: 'dairy-free', label: 'Dairy-Free', description: 'No milk products' },
    { value: 'other', label: 'Other', description: 'Custom lifestyle choice' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lifestyle Type
        </label>
        <select
          value={lifestyleType}
          onChange={(e) => setLifestyleType(e.target.value as LifestyleGoalValue['lifestyleType'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {lifestyleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div>

      {lifestyleType === 'other' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Lifestyle Name
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter custom lifestyle name"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Strictness Level
        </label>
        <div className="space-y-2">
          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="strict"
              checked={strictness === 'strict'}
              onChange={(e) => setStrictness(e.target.value as 'strict')}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">Strict</div>
              <div className="text-sm text-gray-600">Follow all guidelines strictly</div>
            </div>
          </label>

          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="flexible"
              checked={strictness === 'flexible'}
              onChange={(e) => setStrictness(e.target.value as 'flexible')}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">Flexible</div>
              <div className="text-sm text-gray-600">Allow some flexibility and exceptions</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
