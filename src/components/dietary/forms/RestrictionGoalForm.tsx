import { useState, useEffect } from 'react';
import type { RestrictionGoalValue } from '../../../types/dietaryGoals';

interface RestrictionGoalFormProps {
  value?: RestrictionGoalValue;
  onChange: (value: RestrictionGoalValue) => void;
}

export function RestrictionGoalForm({ value, onChange }: RestrictionGoalFormProps) {
  const [restrictionType, setRestrictionType] = useState(value?.restrictionType || '');
  const [flexibility, setFlexibility] = useState<'strict' | 'moderate' | 'flexible'>(
    value?.flexibility || 'moderate'
  );
  const [notes, setNotes] = useState(value?.notes || '');

  useEffect(() => {
    onChange({
      restrictionType,
      flexibility,
      ...(notes ? { notes } : {}),
    });
  }, [restrictionType, flexibility, notes]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restriction Type
        </label>
        <input
          type="text"
          value={restrictionType}
          onChange={(e) => setRestrictionType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., No red meat, No fried foods"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Flexibility Level
        </label>
        <div className="space-y-2">
          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="strict"
              checked={flexibility === 'strict'}
              onChange={(e) => setFlexibility(e.target.value as 'strict')}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">Strict</div>
              <div className="text-sm text-gray-600">No exceptions allowed</div>
            </div>
          </label>

          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="moderate"
              checked={flexibility === 'moderate'}
              onChange={(e) => setFlexibility(e.target.value as 'moderate')}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">Moderate</div>
              <div className="text-sm text-gray-600">Occasional exceptions are okay</div>
            </div>
          </label>

          <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              value="flexible"
              checked={flexibility === 'flexible'}
              onChange={(e) => setFlexibility(e.target.value as 'flexible')}
              className="mr-3 mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">Flexible</div>
              <div className="text-sm text-gray-600">Preference, not a hard rule</div>
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any additional details about this restriction..."
        />
      </div>
    </div>
  );
}
