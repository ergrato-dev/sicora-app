export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          SICORA - Next.js Migration
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sistema de Información de Coordinación Académica
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">✅ Proyecto creado</h2>
            <p className="text-gray-500">Next.js 16 + React 19 + TypeScript</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">✅ Dependencias</h2>
            <p className="text-gray-500">TanStack Query, Zustand, Radix UI</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">✅ Componentes copiados</h2>
            <p className="text-gray-500">/components, /hooks, /stores, /utils</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">⏳ Pendiente</h2>
            <p className="text-gray-500">Adaptar pages a App Router</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Próximos pasos:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Configurar Tailwind v4 con colores SICORA</li>
            <li>Crear layout con sidebar/header</li>
            <li>Migrar páginas: Dashboard, Usuarios, Horarios</li>
            <li>Configurar providers (QueryClient, Zustand)</li>
            <li>Configurar multi-brand (.env)</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
