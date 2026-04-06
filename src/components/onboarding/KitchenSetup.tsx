import { useState, useEffect } from 'react';
import { useKitchen } from '../../contexts/KitchenContext';
import { kitchenPresets, presetLocationSuggestions } from '../../config/kitchenPresets';
import { Home, Flame, Minimize2, Tent, ChevronRight, ChevronLeft, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface KitchenSetupProps {
  onComplete: () => void;
  initialLocation?: string;
}

export function KitchenSetup({ onComplete, initialLocation }: KitchenSetupProps) {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(initialLocation || '');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedAppliances, setSelectedAppliances] = useState<Set<string>>(new Set());
  const [selectedImplements, setSelectedImplements] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cooking', 'storage', 'knives', 'prep', 'cookware', 'utensils']));
  const [saving, setSaving] = useState(false);

  const { appliances, cookingImplements, loading, fetchMasterLists, saveKitchenItems } = useKitchen();

  useEffect(() => {
    fetchMasterLists();
  }, [fetchMasterLists]);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = kitchenPresets.find((p) => p.id === presetId);
    if (!preset) return;

    if (!location) {
      setLocation(presetLocationSuggestions[presetId] || 'Main Kitchen');
    }

    const applianceNames = new Set(preset.appliances);
    const implementNames = new Set(preset.implements);

    const applianceIds = appliances.filter((a) => applianceNames.has(a.name)).map((a) => a.id);
    const implementIds = cookingImplements.filter((i) => implementNames.has(i.name)).map((i) => i.id);

    setSelectedAppliances(new Set(applianceIds));
    setSelectedImplements(new Set(implementIds));
  };

  const handleStartFromScratch = () => {
    setSelectedPreset('scratch');
    if (!location) {
      setLocation('Main Kitchen');
    }
    setSelectedAppliances(new Set());
    setSelectedImplements(new Set());
  };

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
  };

  const toggleImplement = (id: string) => {
    const newSelected = new Set(selectedImplements);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImplements(newSelected);
  };

  const handleSave = async () => {
    if (!location.trim()) return;

    setSaving(true);
    try {
      await saveKitchenItems(
        location.trim(),
        Array.from(selectedAppliances),
        Array.from(selectedImplements)
      );
      onComplete();
    } catch (error) {
      console.error('Error saving kitchen:', error);
      alert('Failed to save kitchen setup. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getPresetIcon = (icon: string) => {
    switch (icon) {
      case 'home':
        return <Home size={48} />;
      case 'flame':
        return <Flame size={48} />;
      case 'minimize':
        return <Minimize2 size={48} />;
      case 'tent':
        return <Tent size={48} />;
      default:
        return <Home size={48} />;
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
  }, {} as Record<string, typeof implements>);

  const filteredAppliances = searchTerm
    ? appliances.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : appliances;

  const filteredImplements = searchTerm
    ? cookingImplements.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : cookingImplements;

  if (loading && appliances.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full text-center">
        <p className="text-gray-600">Loading kitchen items...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Kitchen</h1>
            <p className="text-gray-600">
              {step === 1 && 'Name your kitchen location'}
              {step === 2 && 'Choose a preset or start from scratch'}
              {step === 3 && 'Customize your appliances and tools'}
              {step === 4 && 'Review and confirm your selection'}
            </p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s === step
                    ? 'bg-orange-500 text-white'
                    : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? <Check size={20} /> : s}
              </div>
            ))}
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kitchen Location Name
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Kitchen, Camping Setup, Cabin, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!location.trim()}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kitchenPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                  selectedPreset === preset.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${selectedPreset === preset.id ? 'text-orange-600' : 'text-gray-400'}`}>
                    {getPresetIcon(preset.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{preset.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{preset.appliances.length} appliances</span>
                      <span>{preset.implements.length} tools</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={handleStartFromScratch}
              className={`w-full p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                selectedPreset === 'scratch'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Start from Scratch</h3>
                  <p className="text-sm text-gray-600">Build your own custom kitchen setup</p>
                </div>
                <ChevronRight size={24} className="text-gray-400" />
              </div>
            </button>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedPreset}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-4">
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
              <div className="flex items-center justify-between mb-4">
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

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 flex items-center gap-2"
            >
              Review <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kitchen Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold text-gray-900">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Appliances:</span>
                <span className="font-semibold text-gray-900">{selectedAppliances.size} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cooking Tools:</span>
                <span className="font-semibold text-gray-900">{selectedImplements.size} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-semibold text-gray-900">
                  {selectedAppliances.size + selectedImplements.size} items
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              You can always add more kitchens or modify this setup later in Settings.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Complete Setup'} <Check size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
