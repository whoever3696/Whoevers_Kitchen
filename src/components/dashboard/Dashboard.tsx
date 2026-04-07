import { Calendar, Package, ShoppingCart, Users, Clock } from 'lucide-react';
import { useHousehold } from '../../contexts/HouseholdContext';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const { household, members } = useHousehold();

  const stats = [
    {
      label: 'Household Members',
      value: members.length,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Ingredients Tracked',
      value: 0,
      icon: Package,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Meals Planned',
      value: 0,
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Grocery Items',
      value: 0,
      icon: ShoppingCart,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome back to {household?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Meals</h3>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>No meals planned yet</p>
            <p className="text-sm mt-2">Start planning your meals to see them here</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-orange-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Expiring Soon</h3>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>No ingredients expiring soon</p>
            <p className="text-sm mt-2">Add ingredients to track expiration dates</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-2">Quick Start Guide</h3>
        <p className="mb-6 opacity-90">Get the most out of Whoever's Kitchen</p>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => onViewChange('ingredients')}
            className="bg-white/10 backdrop-blur rounded-lg p-4 text-left transition-all hover:bg-white/20 hover:scale-105 hover:shadow-xl cursor-pointer"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3 font-bold">
              1
            </div>
            <h4 className="font-semibold mb-1">Add Ingredients</h4>
            <p className="text-sm opacity-90">Track what you have in your pantry, fridge, and freezer</p>
          </button>
          <button
            onClick={() => onViewChange('recipes')}
            className="bg-white/10 backdrop-blur rounded-lg p-4 text-left transition-all hover:bg-white/20 hover:scale-105 hover:shadow-xl cursor-pointer"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3 font-bold">
              2
            </div>
            <h4 className="font-semibold mb-1">Browse Recipes</h4>
            <p className="text-sm opacity-90">Discover recipes based on what you already have</p>
          </button>
          <button
            onClick={() => onViewChange('meal-plan')}
            className="bg-white/10 backdrop-blur rounded-lg p-4 text-left transition-all hover:bg-white/20 hover:scale-105 hover:shadow-xl cursor-pointer"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-3 font-bold">
              3
            </div>
            <h4 className="font-semibold mb-1">Plan Meals</h4>
            <p className="text-sm opacity-90">Schedule your weekly meals and generate grocery lists</p>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Household Members</h3>
        </div>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                  {member.user_id.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.user_id}</p>
                  <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {household && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Invitation Code</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold text-blue-900">{household.invitation_code}</code>
              <button
                onClick={() => navigator.clipboard.writeText(household.invitation_code)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-1">Share this code to invite others to your kitchen</p>
          </div>
        )}
      </div>
    </div>
  );
}
