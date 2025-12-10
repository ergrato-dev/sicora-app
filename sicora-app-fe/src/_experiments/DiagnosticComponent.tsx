import React from 'react';
import { useUserStore } from '../stores/userStore';

export function DiagnosticComponent() {
  const { user, isAuthenticated } = useUserStore();

  console.log('DiagnosticComponent - user:', user);
  console.log('DiagnosticComponent - isAuthenticated:', isAuthenticated);
  console.log('DiagnosticComponent - import.meta.env.DEV:', import.meta.env.DEV);

  return (
    <div className='fixed top-4 right-4 bg-red-100 p-4 rounded-lg shadow-lg z-50 max-w-md'>
      <h3 className='font-bold text-red-800 mb-2'>🔍 Diagnóstico Debug</h3>
      <div className='text-sm text-red-700 space-y-1'>
        <div>Usuario: {user ? user.name : 'No definido'}</div>
        <div>Autenticado: {isAuthenticated ? 'Sí' : 'No'}</div>
        <div>Modo Dev: {import.meta.env.DEV ? 'Sí' : 'No'}</div>
        <div>Timestamp: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
