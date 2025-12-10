import { BrowserRouter } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useEffect } from 'react';
import { AppRouter } from './router';

// Componente de prueba con AppRouter original
function AppRouterOriginalTest() {
  const { initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  try {
    return (
      <BrowserRouter>
        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
          <h1 style={{ color: '#39a900' }}>🧪 Test AppRouter ORIGINAL</h1>

          <AppRouter />
        </div>
      </BrowserRouter>
    );
  } catch (error) {
    console.error('Error en AppRouterOriginalTest:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Error en AppRouterOriginalTest</h1>
        <p>Error: {(error as Error)?.message || 'Error desconocido'}</p>
        <p>El problema está en el AppRouter original o en algún componente específico</p>
      </div>
    );
  }
}

export default AppRouterOriginalTest;
