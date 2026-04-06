import { useState, useEffect } from 'react';
import { Package, Plus, CreditCard as Edit2, Trash2, AlertCircle, Search } from 'lucide-react';
import { useIngredient } from '../../contexts/IngredientContext';
import { AddIngredientModal } from './AddIngredientModal';

type StorageTab = 'all' | 'pantry' | 'fridge' | 'freezer';

export function IngredientsView() {
  const { householdIngredients, loading, fetchHouseholdIngredients, deleteIngredient } = useIngredient();
  const [activeTab, setActiveTab] = useState<StorageTab>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHouseholdIngredients();
  }, [fetchHouseholdIngredients]);

  const handleEdit = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteIngredient(id);
      } catch (error) {
        alert('Failed to delete ingredient. Please try again.');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingIngredient(null);
  };

  const isExpiringSoon = (expirationDate: string | null) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
  };

  const isExpired = (expirationDate: string | null) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today;
  };

  const filteredIngredients = householdIngredients.filter((ingredient) => {
    const matchesTab = activeTab === 'all' || ingredient.storage_location === activeTab;
    const matchesSearch = ingredient.ingredient_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const groupedIngredients = filteredIngredients.reduce((acc, ingredient) => {
    const location = ingredient.storage_location || 'unknown';
    if (!acc[location]) acc[location] = [];
    acc[location].push(ingredient);
    return acc;
  }, {} as Record<string, typeof householdIngredients>);

  const expiringCount = householdIngredients.filter((ing) => isExpiringSoon(ing.expiration_date)).length;
  const expiredCount = householdIngredients.filter((ing) => isExpired(ing.expiration_date)).length;

  const tabs: { id: StorageTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pantry', label: 'Pantry' },
    { id: 'fridge', label: 'Fridge' },
    { id: 'freezer', label: 'Freezer' },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ingredients</h2>
          <p className="text-gray-600">Manage your kitchen inventory</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} />
          Add Ingredient
        </button>
      </div>

      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="space-y-2">
          {expiredCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Expired Ingredients</h4>
                <p className="text-sm text-red-700">
                  You have {expiredCount} expired ingredient{expiredCount !== 1 ? 's' : ''} in your inventory
                </p>
              </div>
            </div>
          )}
          {expiringCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Expiring Soon</h4>
                <p className="text-sm text-amber-700">
                  You have {expiringCount} ingredient{expiringCount !== 1 ? 's' : ''} expiring within 7 days
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-4 p-4">
            <div className="flex flex-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ingredients..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading && householdIngredients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading ingredients...</p>
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block bg-gray-100 p-6 rounded-full mb-4">
                <Package size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No ingredients found' : `No ingredients in ${activeTab === 'all' ? 'inventory' : activeTab}`}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Try a different search term'
                  : 'Start tracking your ingredients to get personalized recipe suggestions'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Add Your First Ingredient
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'all' ? (
                Object.entries(groupedIngredients).map(([location, ingredients]) => (
                  <div key={location}>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 capitalize">{location}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ingredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                            isExpired(ingredient.expiration_date)
                              ? 'border-red-300 bg-red-50'
                              : isExpiringSoon(ingredient.expiration_date)
                              ? 'border-amber-300 bg-amber-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{ingredient.ingredient_name}</h4>
                              <p className="text-sm text-gray-600 capitalize">{ingredient.ingredient_category}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(ingredient)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(ingredient.id, ingredient.ingredient_name || 'ingredient')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              {ingredient.quantity} {ingredient.unit}
                            </p>
                            {ingredient.expiration_date && (
                              <p className={`text-xs ${
                                isExpired(ingredient.expiration_date)
                                  ? 'text-red-700 font-semibold'
                                  : isExpiringSoon(ingredient.expiration_date)
                                  ? 'text-amber-700 font-medium'
                                  : 'text-gray-600'
                              }`}>
                                {isExpired(ingredient.expiration_date) ? 'Expired: ' : 'Expires: '}
                                {formatDate(ingredient.expiration_date)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        isExpired(ingredient.expiration_date)
                          ? 'border-red-300 bg-red-50'
                          : isExpiringSoon(ingredient.expiration_date)
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{ingredient.ingredient_name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{ingredient.ingredient_category}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(ingredient)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(ingredient.id, ingredient.ingredient_name || 'ingredient')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {ingredient.quantity} {ingredient.unit}
                        </p>
                        {ingredient.expiration_date && (
                          <p className={`text-xs ${
                            isExpired(ingredient.expiration_date)
                              ? 'text-red-700 font-semibold'
                              : isExpiringSoon(ingredient.expiration_date)
                              ? 'text-amber-700 font-medium'
                              : 'text-gray-600'
                          }`}>
                            {isExpired(ingredient.expiration_date) ? 'Expired: ' : 'Expires: '}
                            {formatDate(ingredient.expiration_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-1">Quick Add</h4>
          <p className="text-sm text-blue-700">
            Add common staple ingredients quickly with smart defaults
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-1">Track Expiration</h4>
          <p className="text-sm text-green-700">
            Get notified when ingredients are about to expire
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-1">Smart Inventory</h4>
          <p className="text-sm text-orange-700">
            Track quantities and get recipe suggestions based on what you have
          </p>
        </div>
      </div>

      <AddIngredientModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        editingIngredient={editingIngredient}
      />
    </div>
  );
}
