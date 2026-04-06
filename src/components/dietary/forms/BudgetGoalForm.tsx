import { useState, useEffect } from 'react';
import { useHousehold } from '../../../contexts/HouseholdContext';
import type { BudgetGoalValue } from '../../../types/dietaryGoals';

interface BudgetGoalFormProps {
  value?: BudgetGoalValue;
  onChange: (value: BudgetGoalValue) => void;
}

export function BudgetGoalForm({ value, onChange }: BudgetGoalFormProps) {
  const { household } = useHousehold();
  const [amount, setAmount] = useState(value?.amount || 0);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>(value?.period || 'weekly');

  useEffect(() => {
    if (household?.id) {
      onChange({
        amount,
        period,
        household_id: household.id,
      });
    }
  }, [amount, period, household?.id]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget Amount ($)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter budget amount"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget Period
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="weekly"
              checked={period === 'weekly'}
              onChange={(e) => setPeriod(e.target.value as 'weekly')}
              className="mr-2"
            />
            Weekly
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="monthly"
              checked={period === 'monthly'}
              onChange={(e) => setPeriod(e.target.value as 'monthly')}
              className="mr-2"
            />
            Monthly
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        This budget applies to your entire household: {household?.name || 'Unknown'}
      </div>
    </div>
  );
}
