import { useState, useEffect } from 'react';
import { X, Sparkles, ShoppingBasket, Check } from 'lucide-react';
import { useIngredient } from '../../contexts/IngredientContext';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StapleIngredient {
  id: string;
  name: string;
  category: string;
  defaultStorage: 'pantry' | 'fridge' | 'freezer';
  defaultQuantity: number;
  defaultUnit: string;
}

const stapleCategories = {
  dairy: {
    name: 'Dairy Basics',
    items: [
      { name: 'Milk', defaultQuantity: 1, defaultUnit: 'gallon', defaultStorage: 'fridge' as const },
      { name: 'Eggs', defaultQuantity: 12, defaultUnit: 'pieces', defaultStorage: 'fridge' as const },
      { name: 'Butter', defaultQuantity: 1, defaultUnit: 'lb', defaultStorage: 'fridge' as const },
      { name: 'Cheddar Cheese', defaultQuantity: 8, defaultUnit: 'oz', defaultStorage: 'fridge' as const },
      { name: 'Yogurt', defaultQuantity: 32, defaultUnit: 'oz', defaultStorage: 'fridge' as const },
      { name: 'Sour Cream', defaultQuantity: 16, defaultUnit: 'oz', defaultStorage: 'fridge' as const },
    ]
  },
  baking: {
    name: 'Baking Essentials',
    items: [
      { name: 'All-Purpose Flour', defaultQuantity: 5, defaultUnit: 'lb', defaultStorage: 'pantry' as const },
      { name: 'White Sugar', defaultQuantity: 4, defaultUnit: 'lb', defaultStorage: 'pantry' as const },
      { name: 'Brown Sugar', defaultQuantity: 2, defaultUnit: 'lb', defaultStorage: 'pantry' as const },
      { name: 'Baking Powder', defaultQuantity: 1, defaultUnit: 'packages', defaultStorage: 'pantry' as const },
      { name: 'Baking Soda', defaultQuantity: 1, defaultUnit: 'packages', defaultStorage: 'pantry' as const },
      { name: 'Vanilla Extract', defaultQuantity: 1, defaultUnit: 'bottles', defaultStorage: 'pantry' as const },
    ]
  },
  pantry: {
    name: 'Pantry Staples',
    items: [
      { name: 'Rice', defaultQuantity: 2, defaultUnit: 'lb', defaultStorage: 'pantry' as const },
      { name: 'Pasta', defaultQuantity: 1, defaultUnit: 'lb', defaultStorage: 'pantry' as const },
      { name: 'Olive Oil', defaultQuantity: 1, defaultUnit: 'bottles', defaultStorage: 'pantry' as const },
      { name: 'Salt', defaultQuantity: 1, defaultUnit: 'containers', defaultStorage: 'pantry' as const },
      { name: 'Black Pepper', defaultQuantity: 1, defaultUnit: 'containers', defaultStorage: 'pantry' as const },
      { name: 'Garlic', defaultQuantity: 2, defaultUnit: 'heads', defaultStorage: 'pantry' as const },
      { name: 'Onions', defaultQuantity: 3, defaultUnit: 'pieces', defaultStorage: 'pantry' as const },
    ]
  },
  condiments: {
    name: 'Common Condiments',
    items: [
      { name: 'Ketchup', defaultQuantity: 1, defaultUnit: 'bottles', defaultStorage: 'fridge' as const },
      { name: 'Mustard', defaultQuantity: 1, defaultUnit: 'bottles', defaultStorage: 'fridge' as const },
      { name: 'Mayonnaise', defaultQuantity: 1, defaultUnit: 'jars', defaultStorage: 'fridge' as const },
      { name: 'Soy Sauce', defaultQuantity: 1, defaultUnit: 'bottles', defaultStorage: 'pantry' as const },
    ]
  },
  canned: {
    name: 'Canned & Preserved',
    items: [
      { name: 'Canned Tomatoes', defaultQuantity: 2, defaultUnit: 'cans', defaultStorage: 'pantry' as const },
      { name: 'Chicken Broth', defaultQuantity: 2, defaultUnit: 'cans', defaultStorage: 'pantry' as const },
      { name: 'Vegetable Broth', defaultQuantity: 2, defaultUnit: 'cans', defaultStorage: 'pantry' as const },
    ]
  },
  frozen: {
    name: 'Frozen Basics',
    items: [
      { name: 'Frozen Vegetables', defaultQuantity: 2, defaultUnit: 'packages', defaultStorage: 'freezer' as const },
      { name: 'Frozen Berries', defaultQuantity: 1, defaultUnit: 'packages', defaultStorage: 'freezer' as const },
    ]
  }
};

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const { masterIngredients, addIngredient, fetchMasterIngredients } = useIngredient();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen && masterIngredients.length === 0) {
      fetchMasterIngredients();
    }
  }, [isOpen, masterIngredients.length, fetchMasterIngredients]);

  if (!isOpen) return null;

  const toggleItem = (itemName: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
    } else {
      newSelected.add(itemName);
    }
    setSelectedItems(newSelected);
  };

  const selectCategory = (category: string) => {
    const categoryData = stapleCategories[category as keyof typeof stapleCategories];
    if (!categoryData) return;

    const newSelected = new Set(selectedItems);
    const categoryItems = categoryData.items.map(item => item.name);

    const allSelected = categoryItems.every(item => selectedItems.has(item));

    if (allSelected) {
      categoryItems.forEach(item => newSelected.delete(item));
    } else {
      categoryItems.forEach(item => newSelected.add(item));
    }

    setSelectedItems(newSelected);
  };

  const handleQuickAdd = async () => {
    if (selectedItems.size === 0) return;

    setAdding(true);
    try {
      const allItems = Object.values(stapleCategories).flatMap(cat => cat.items);

      for (const itemName of Array.from(selectedItems)) {
        const stapleItem = allItems.find(item => item.name === itemName);
        if (!stapleItem) continue;

        const masterIngredient = masterIngredients.find(
          ing => ing.name.toLowerCase() === itemName.toLowerCase()
        );

        await addIngredient({
          ingredientId: masterIngredient?.id || null,
          customName: masterIngredient ? undefined : itemName,
          quantity: stapleItem.defaultQuantity,
          unit: stapleItem.defaultUnit,
          storageLocation: stapleItem.defaultStorage,
        });
      }

      setSelectedItems(new Set());
      onClose();
    } catch (error) {
      console.error('Error adding ingredients:', error);
      alert('Failed to add some ingredients. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const categories = Object.entries(stapleCategories);
  const filteredCategories = activeCategory === 'all'
    ? categories
    : categories.filter(([key]) => key === activeCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Sparkles className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Quick Add Staples</h3>
              <p className="text-sm text-gray-600">Select common ingredients to add to your inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 px-6 py-4 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredCategories.map(([categoryKey, category]) => {
            const categoryItems = category.items.map(item => item.name);
            const selectedCount = categoryItems.filter(item => selectedItems.has(item)).length;
            const allSelected = selectedCount === categoryItems.length;

            return (
              <div key={categoryKey}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900">{category.name}</h4>
                  <button
                    onClick={() => selectCategory(categoryKey)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'} ({selectedCount}/{categoryItems.length})
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.items.map((item) => {
                    const isSelected = selectedItems.has(item.name);
                    return (
                      <button
                        key={item.name}
                        onClick={() => toggleItem(item.name)}
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-gray-900 truncate">{item.name}</h5>
                              {isSelected && (
                                <div className="flex-shrink-0 bg-blue-600 text-white rounded-full p-0.5">
                                  <Check size={14} />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {item.defaultQuantity} {item.defaultUnit}
                            </p>
                            <p className="text-xs text-gray-500 capitalize mt-1">
                              {item.defaultStorage}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <ShoppingBasket size={20} />
              <span className="font-medium">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={adding}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickAdd}
                disabled={selectedItems.size === 0 || adding}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : `Add ${selectedItems.size} Ingredient${selectedItems.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
