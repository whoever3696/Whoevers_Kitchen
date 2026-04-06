import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { GoalType, GoalValue } from '../../types/dietaryGoals';
import type { Database } from '../../lib/database.types';
import { BudgetGoalForm } from './forms/BudgetGoalForm';
import { DiversityGoalForm } from './forms/DiversityGoalForm';
import { NutritionGoalForm } from './forms/NutritionGoalForm';
import { AllergyGoalForm } from './forms/AllergyGoalForm';
import { IntoleranceGoalForm } from './forms/IntoleranceGoalForm';
import { RestrictionGoalForm } from './forms/RestrictionGoalForm';
import { LifestyleGoalForm } from './forms/LifestyleGoalForm';

type DietaryGoal = Database['public']['Tables']['dietary_goals']['Row'];

interface AddEditDietaryGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalType: GoalType, goalValue: GoalValue) => Promise<void>;
  editingGoal?: DietaryGoal | null;
}

export function AddEditDietaryGoalModal({
  isOpen,
  onClose,
  onSave,
  editingGoal,
}: AddEditDietaryGoalModalProps) {
  const [goalType, setGoalType] = useState<GoalType>('budget');
  const [goalValue, setGoalValue] = useState<GoalValue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingGoal) {
      setGoalType(editingGoal.goal_type as GoalType);
      setGoalValue(editingGoal.goal_value as GoalValue);
    } else {
      setGoalType('budget');
      setGoalValue(null);
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!goalValue) {
      setError('Please fill out all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(goalType, goalValue);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const goalTypeOptions = [
    { value: 'budget', label: 'Budget Goal' },
    { value: 'diversity', label: 'Diversity Goal' },
    { value: 'nutrition', label: 'Nutrition Goal' },
    { value: 'allergy', label: 'Allergy' },
    { value: 'intolerance', label: 'Intolerance' },
    { value: 'restriction', label: 'Dietary Restriction' },
    { value: 'lifestyle', label: 'Lifestyle Choice' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingGoal ? 'Edit Dietary Goal' : 'Add Dietary Goal'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!editingGoal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Type
              </label>
              <select
                value={goalType}
                onChange={(e) => {
                  setGoalType(e.target.value as GoalType);
                  setGoalValue(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {goalTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            {goalType === 'budget' && (
              <BudgetGoalForm
                value={goalValue as any}
                onChange={setGoalValue}
              />
            )}
            {goalType === 'diversity' && (
              <DiversityGoalForm
                value={goalValue as any}
                onChange={setGoalValue}
              />
            )}
            {goalType === 'nutrition' && (
              <NutritionGoalForm
                value={goalValue as any}
                onChange={setGoalValue}
              />
            )}
            {goalType === 'allergy' && (
              <AllergyGoalForm
                value={goalValue as any}
                onChange={setGoalValue}
              />
            )}
            {goalType === 'intolerance' && (
              <IntoleranceGoalForm
                value={goalValue as any}
                onChange={setGoalValue}
              />
            )}
            {goalType === 'restriction' && (
              <RestrictionGoalForm
                value={goalValue as any}
                onChange={setGoalValue}
              />
            )}
            {goalType === 'lifestyle' && (
              <LifestyleGoalForm
                value={goalValue as any}
                onChange={setGoalValue}
              />
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !goalValue}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}
