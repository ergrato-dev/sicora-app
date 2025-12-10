import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useUserStore } from './stores/userStore';

function AppDebug() {
  const { initializeUser, user, isAuthenticated } = useUserStore();

  useEffect(() => {
    console.log('🔍 AppDebug - Inicializando usuario...');
    try {
      initializeUser();
      console.log('✅ AppDebug - Usuario inicializado:', user);
    } catch (error) {
      console.error('❌ AppDebug - Error en initializeUser:', error);
    }
  }, [initializeUser, user]);

  console.log('🔍 AppDebug - Renderizando, usuario:', user, 'autenticado:', isAuthenticated);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#39a900' }}>🔍 SICORA - Debug App</h1>

      <div
        style={{
          backgroundColor: '#f0f0f0',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h2>Estado del Store:</h2>
        <p>
          <strong>Usuario:</strong> {user ? user.name : 'No definido'}
        </p>
        <p>
          <strong>Email:</strong> {user ? user.email : 'No definido'}
        </p>
        <p>
          <strong>Role:</strong> {user ? user.role : 'No definido'}
        </p>
        <p>
          <strong>Autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#e8f5e8',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h2>Prueba de React Router:</h2>
        <BrowserRouter>
          <div>
            <p>✅ React Router funcionando</p>
            <p>Ruta actual: {window.location.pathname}</p>
          </div>
        </BrowserRouter>
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
        <h2>Siguiente paso:</h2>
        <p>Si esto funciona, el problema está en el AppRouter o en algún componente específico.</p>
      </div>
    </div>
  );
}

export default AppDebug;
