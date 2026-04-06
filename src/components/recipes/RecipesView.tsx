import { ChefHat, Clock, TrendingUp } from 'lucide-react';

export function RecipesView() {
  const difficultyLevels = [
    { id: 'fast_easy', label: 'Fast & Easy', icon: Clock, color: 'text-green-600 bg-green-100' },
    { id: 'moderate', label: 'Moderate', icon: TrendingUp, color: 'text-orange-600 bg-orange-100' },
    { id: 'fancy', label: 'Fancy', icon: ChefHat, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe Suggestions</h2>
        <p className="text-gray-600">Personalized recipes based on your kitchen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficultyLevels.map((level) => {
          const Icon = level.icon;
          return (
            <div key={level.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className={`w-12 h-12 rounded-lg ${level.color} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{level.label}</h3>
              <p className="text-gray-600 text-sm mb-4">
                No recipes available yet
              </p>
              <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Browse All
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="inline-block bg-gray-100 p-6 rounded-full mb-4">
          <ChefHat size={48} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipes Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start by adding ingredients to your kitchen. We'll then suggest recipes based on what you have available.
        </p>
      </div>
    </div>
  );
}
