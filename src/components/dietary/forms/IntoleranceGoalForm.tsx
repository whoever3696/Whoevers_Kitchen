import { useState, useEffect } from 'react';
import type { IntoleranceGoalValue } from '../../../types/dietaryGoals';

interface IntoleranceGoalFormProps {
  value?: IntoleranceGoalValue;
  onChange: (value: IntoleranceGoalValue) => void;
}

export function IntoleranceGoalForm({ value, onChange }: IntoleranceGoalFormProps) {
  const [ingredient, setIngredient] = useState(value?.ingredient || '');
  const [toleranceLevel, setToleranceLevel] = useState<'never' | 'rarely' | 'occasionally'>(
    value?.toleranceLevel || 'rarely'
  );

  useEffect(() => {
    onChange({
      ingredient,
      toleranceLevel,
    });
  }, [ingredient, toleranceLevel]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingredient
        </label>
        <input
          type="text"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter ingredient name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tolerance Level
        </label>
        <div className="space-y-2">
          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="never"
              checked={toleranceLevel === 'never'}
              onChange={(e) => setToleranceLevel(e.target.value as 'never')}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">Never</div>
              <div className="text-sm text-gray-600">Completely avoid this ingredient</div>
            </div>
          </label>

          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="rarely"
              checked={toleranceLevel === 'rarely'}
              onChange={(e) => setToleranceLevel(e.target.value as 'rarely')}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">Rarely</div>
              <div className="text-sm text-gray-600">Limit to once or twice per week</div>
            </div>
          </label>

          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="occasionally"
              checked={toleranceLevel === 'occasionally'}
              onChange={(e) => setToleranceLevel(e.target.value as 'occasionally')}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">Occasionally</div>
              <div className="text-sm text-gray-600">Can have in moderation, a few times per week</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
