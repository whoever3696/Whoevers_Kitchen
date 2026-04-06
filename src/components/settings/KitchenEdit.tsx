import { useState, useEffect } from 'react';
import { useKitchen } from '../../contexts/KitchenContext';
import { Search, ChevronDown, ChevronUp, Save, X } from 'lucide-react';

interface KitchenEditProps {
  location: string;
  onSave: () => void;
  onCancel: () => void;
}

export function KitchenEdit({ location, onSave, onCancel }: KitchenEditProps) {
  const [selectedAppliances, setSelectedAppliances] = useState<Set<string>>(new Set());
  const [selectedImplements, setSelectedImplements] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['cooking', 'storage', 'knives', 'prep', 'cookware', 'utensils'])
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { appliances, cookingImplements, fetchMasterLists, getKitchenItems, saveKitchenItems } = useKitchen();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchMasterLists();
        const items = await getKitchenItems(location);
        setSelectedAppliances(new Set(items.appliances));
        setSelectedImplements(new Set(items.implements));
      } catch (error) {
        console.error('Error loading kitchen data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location, fetchMasterLists, getKitchenItems]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleAppliance = (id: string) => {
    const newSelected = new Set(selectedAppliances);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAppliances(newSelected);
    setHasChanges(true);
  };

  const toggleImplement = (id: string) => {
    const newSelected = new Set(selectedImplements);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImplements(newSelected);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveKitchenItems(
        location,
        Array.from(selectedAppliances),
        Array.from(selectedImplements)
      );
      onSave();
    } catch (error) {
      console.error('Error saving kitchen:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const appliancesByCategory = appliances.reduce((acc, appliance) => {
    if (!acc[appliance.category]) acc[appliance.category] = [];
    acc[appliance.category].push(appliance);
    return acc;
  }, {} as Record<string, typeof appliances>);

  const implementsByCategory = cookingImplements.reduce((acc, implement) => {
    if (!acc[implement.category]) acc[implement.category] = [];
    acc[implement.category].push(implement);
    return acc;
  }, {} as Record<string, typeof cookingImplements>);

  const filteredAppliances = searchTerm
    ? appliances.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : appliances;

  const filteredImplements = searchTerm
    ? cookingImplements.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : cookingImplements;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl w-full text-center">
        <p className="text-gray-600">Loading kitchen items...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Kitchen: {location}</h1>
        <p className="text-gray-600">Update your appliances and cooking tools</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search items..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto mb-6">
        <div>
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2 z-10">
            <h3 className="text-lg font-bold text-gray-900">Appliances</h3>
            <span className="text-sm text-gray-600">
              {selectedAppliances.size} selected
            </span>
          </div>
          <div className="space-y-2">
            {searchTerm ? (
              filteredAppliances.map((appliance) => (
                <label key={appliance.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAppliances.has(appliance.id)}
                    onChange={() => toggleAppliance(appliance.id)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-gray-900">{appliance.name}</span>
                </label>
              ))
            ) : (
              Object.entries(appliancesByCategory).map(([category, items]) => (
                <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
                  >
                    <span className="font-semibold text-gray-900 capitalize">{category}</span>
                    {expandedCategories.has(category) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedCategories.has(category) && (
                    <div className="p-2">
                      {items.map((appliance) => (
                        <label key={appliance.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAppliances.has(appliance.id)}
                            onChange={() => toggleAppliance(appliance.id)}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                          <span className="text-gray-900">{appliance.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2 z-10">
            <h3 className="text-lg font-bold text-gray-900">Cooking Tools</h3>
            <span className="text-sm text-gray-600">
              {selectedImplements.size} selected
            </span>
          </div>
          <div className="space-y-2">
            {searchTerm ? (
              filteredImplements.map((implement) => (
                <label key={implement.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedImplements.has(implement.id)}
                    onChange={() => toggleImplement(implement.id)}
                    className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-900">{implement.name}</span>
                </label>
              ))
            ) : (
              Object.entries(implementsByCategory).map(([category, items]) => (
                <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
                  >
                    <span className="font-semibold text-gray-900 capitalize">{category}</span>
                    {expandedCategories.has(category) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedCategories.has(category) && (
                    <div className="p-2">
                      {items.map((implement) => (
                        <label key={implement.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedImplements.has(implement.id)}
                            onChange={() => toggleImplement(implement.id)}
                            className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                          />
                          <span className="text-gray-900">{implement.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <X size={20} /> Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
