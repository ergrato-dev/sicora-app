import React from 'react';

// Componente de diagnóstico simple
function SimpleApp() {
  console.log('SimpleApp - Renderizando');

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#39a900', fontSize: '24px' }}>🔍 SICORA - Diagnóstico Simple</h1>
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px 0',
        }}
      >
        <h2>Estado del Sistema:</h2>
        <ul>
          <li>✅ React está funcionando</li>
          <li>✅ HTML se está renderizando</li>
          <li>✅ JavaScript está ejecutándose</li>
          <li>✅ CSS básico se está aplicando</li>
        </ul>
      </div>
      <div
        style={{
          backgroundColor: '#e8f5e8',
          padding: '15px',
          borderRadius: '5px',
          border: '1px solid #39a900',
        }}
      >
        <p>
          <strong>Timestamp:</strong> {new Date().toLocaleString()}
        </p>
        <p>
          <strong>Environment:</strong> {import.meta.env.MODE}
        </p>
        <p>
          <strong>DEV Mode:</strong> {import.meta.env.DEV ? 'Sí' : 'No'}
        </p>
      </div>
    </div>
  );
}

export default SimpleApp;
