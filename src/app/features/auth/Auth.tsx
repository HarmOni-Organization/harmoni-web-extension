import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';

type AuthView = 'login' | 'register';

export const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

  const handleSwitchToRegister = () => {
    setView('register');
  };

  const handleSwitchToLogin = () => {
    setView('login');
  };

  return (
    <div className="w-full h-full flex items-center justify-center py-6">
      {view === 'login' ? (
        <Login onSwitchToRegister={handleSwitchToRegister} />
      ) : (
        <Register onSwitchToLogin={handleSwitchToLogin} />
      )}
    </div>
  );
};
