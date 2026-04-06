import { Calendar, Plus } from 'lucide-react';

export function MealPlanView() {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Meal Plan</h2>
          <p className="text-gray-600">Plan your weekly meals</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors">
          <Plus size={20} />
          Add Meal
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              Previous
            </button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center">
              <div className="font-semibold text-gray-900 mb-2">{day}</div>
              <div className="space-y-2">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-32 flex items-center justify-center">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Plus size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="inline-block bg-purple-100 p-6 rounded-full mb-4">
          <Calendar size={48} className="text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Planning Your Meals</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Plan your weekly meals to stay organized and automatically generate grocery lists for missing ingredients.
        </p>
      </div>
    </div>
  );
}
