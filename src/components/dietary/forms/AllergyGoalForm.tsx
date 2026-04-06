import { useState, useEffect } from 'react';
import type { AllergyGoalValue } from '../../../types/dietaryGoals';

interface AllergyGoalFormProps {
  value?: AllergyGoalValue;
  onChange: (value: AllergyGoalValue) => void;
}

export function AllergyGoalForm({ value, onChange }: AllergyGoalFormProps) {
  const [allergen, setAllergen] = useState(value?.allergen || '');

  useEffect(() => {
    onChange({ allergen });
  }, [allergen]);

  const commonAllergens = [
    'Peanuts',
    'Tree Nuts',
    'Milk',
    'Eggs',
    'Fish',
    'Shellfish',
    'Soy',
    'Wheat',
    'Sesame',
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allergen
        </label>
        <input
          type="text"
          value={allergen}
          onChange={(e) => setAllergen(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter allergen name"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Common Allergens:</p>
        <div className="flex flex-wrap gap-2">
          {commonAllergens.map((common) => (
            <button
              key={common}
              type="button"
              onClick={() => setAllergen(common)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              {common}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
        <strong>Strict Allergen:</strong> This ingredient will be completely avoided in meal planning.
      </div>
    </div>
  );
}
