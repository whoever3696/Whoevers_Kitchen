import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HouseholdProvider, useHousehold } from './contexts/HouseholdContext';
import { KitchenProvider } from './contexts/KitchenContext';
import { AuthPage } from './components/auth/AuthPage';
import { HouseholdSetup } from './components/onboarding/HouseholdSetup';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/dashboard/Dashboard';
import { RecipesView } from './components/recipes/RecipesView';
import { MealPlanView } from './components/mealplan/MealPlanView';
import { IngredientsView } from './components/ingredients/IngredientsView';
import { GroceryListView } from './components/grocery/GroceryListView';
import { SettingsView } from './components/settings/SettingsView';
import { ChefHat, Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { household, loading: householdLoading } = useHousehold();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  if (authLoading || householdLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block bg-orange-100 p-6 rounded-full mb-4">
            <ChefHat size={64} className="text-orange-600 animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-orange-600" size={24} />
            <p className="text-lg text-gray-700">Loading your kitchen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!household && !onboardingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <HouseholdSetup onComplete={() => setOnboardingComplete(true)} />
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'recipes':
        return <RecipesView />;
      case 'meal-plan':
        return <MealPlanView />;
      case 'ingredients':
        return <IngredientsView />;
      case 'grocery-list':
        return <GroceryListView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <HouseholdProvider>
        <KitchenProvider>
          <AppContent />
        </KitchenProvider>
      </HouseholdProvider>
    </AuthProvider>
  );
}

export default App;
