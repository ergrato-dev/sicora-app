import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { LayoutWrapper } from './components/LayoutWrapper';

// Componente de prueba SOLO con Dashboard
function AppDashboardTest() {
  const { initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  try {
    return (
      <BrowserRouter>
        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
          <h1 style={{ color: '#39a900' }}>🧪 Test Dashboard Component</h1>

          <Routes>
            <Route path='/' element={<LayoutWrapper />}>
              <Route index element={<Dashboard />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    );
  } catch (error) {
    console.error('Error en AppDashboardTest:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Error en AppDashboardTest</h1>
        <p>Error: {(error as Error)?.message || 'Error desconocido'}</p>
        <p>El problema está en el componente Dashboard</p>
      </div>
    );
  }
}

export default AppDashboardTest;
