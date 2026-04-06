import { useState, useEffect } from 'react';
import type { NutritionGoalValue } from '../../../types/dietaryGoals';

interface NutritionGoalFormProps {
  value?: NutritionGoalValue;
  onChange: (value: NutritionGoalValue) => void;
}

export function NutritionGoalForm({ value, onChange }: NutritionGoalFormProps) {
  const [calorieTarget, setCalorieTarget] = useState<number | undefined>(value?.calorieTarget);
  const [proteinTarget, setProteinTarget] = useState<number | undefined>(value?.proteinTarget);

  useEffect(() => {
    onChange({
      ...(calorieTarget ? { calorieTarget } : {}),
      ...(proteinTarget ? { proteinTarget } : {}),
    });
  }, [calorieTarget, proteinTarget]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Daily Calorie Target (optional)
        </label>
        <input
          type="number"
          min="0"
          value={calorieTarget || ''}
          onChange={(e) => setCalorieTarget(e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 2000"
        />
        <p className="mt-1 text-sm text-gray-500">Minimum daily calories</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Daily Protein Target (g, optional)
        </label>
        <input
          type="number"
          min="0"
          value={proteinTarget || ''}
          onChange={(e) => setProteinTarget(e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 50"
        />
        <p className="mt-1 text-sm text-gray-500">Minimum daily protein in grams</p>
      </div>

      {!calorieTarget && !proteinTarget && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          Please set at least one nutrition target
        </div>
      )}
    </div>
  );
}
