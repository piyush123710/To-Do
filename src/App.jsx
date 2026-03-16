import React, { useState } from 'react';
import { NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import { nhost } from './lib/nhost';
import Login from './pages/Login';
import { useAuthenticationStatus } from '@nhost/react';

const AuthGate = () => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost} devtools={{ enabled: true }}>
        <div className="min-h-screen p-4 md:p-8">
          <AuthGate />
        </div>
      </NhostApolloProvider>
    </NhostProvider>
  );
}

export default App;
