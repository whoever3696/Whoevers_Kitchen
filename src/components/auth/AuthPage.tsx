import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ChefHat } from 'lucide-react';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full">
              <ChefHat size={48} className="text-orange-600" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Whoever's Kitchen</h1>
            <p className="text-gray-600 mt-2">Your personal kitchen helper</p>
          </div>

          {mode === 'login' ? (
            <LoginForm onToggleMode={() => setMode('signup')} />
          ) : (
            <SignUpForm onToggleMode={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
