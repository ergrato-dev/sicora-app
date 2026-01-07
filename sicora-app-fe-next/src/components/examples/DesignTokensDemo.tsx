/**
 * DesignTokensDemo - Componente para demostrar el uso de tokens de design SENA
 * Muestra ejemplos prácticos de espaciado, sizing, colores y otros tokens
 */
export function DesignTokensDemo() {
  return (
    <div className='max-w-sena-container mx-auto p-sena-content-padding space-y-sena-section-gap'>
      {/* Header de la demo */}
      <header className='text-center space-y-sena-md'>
        <h1 className='text-sena-4xl font-sena-heading text-sena-primary-700'>
          🎨 Sistema de Design Tokens SENA
        </h1>
        <p className='text-sena-lg text-sena-neutral-600 max-w-sena-content mx-auto'>
          Demostración del sistema completo de tokens de diseño implementado para SICORA
        </p>
      </header>

      {/* Sección de Espaciado */}
      <section className='space-y-sena-lg'>
        <h2 className='text-sena-2xl font-sena-heading text-sena-primary-600 border-b border-sena-neutral-200 pb-sena-sm'>
          📏 Tokens de Espaciado
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sena-module-gap'>
          {/* Espaciado Micro */}
          <div className='p-sena-card-padding bg-white rounded-sena-card shadow-sena-card space-y-sena-sm'>
            <h3 className='text-sena-lg font-sena-heading text-sena-neutral-800'>
              Espaciado Micro
            </h3>
            <div className='space-y-sena-xs'>
              <div className='bg-sena-primary-100 p-sena-xs rounded-sena-sm'>sena-xs (4px)</div>
              <div className='bg-sena-primary-200 p-sena-sm rounded-sena-sm'>sena-sm (8px)</div>
              <div className='bg-sena-primary-300 p-sena-md rounded-sena-sm'>sena-md (12px)</div>
            </div>
          </div>

          {/* Espaciado Estándar */}
          <div className='p-sena-card-padding bg-white rounded-sena-card shadow-sena-card space-y-sena-sm'>
            <h3 className='text-sena-lg font-sena-heading text-sena-neutral-800'>
              Espaciado Estándar
            </h3>
            <div className='space-y-sena-sm'>
              <div className='bg-sena-secondary-100 p-sena-lg rounded-sena-sm'>sena-lg (16px)</div>
              <div className='bg-sena-secondary-200 p-sena-xl rounded-sena-sm'>sena-xl (20px)</div>
              <div className='bg-sena-secondary-300 p-sena-2xl rounded-sena-sm'>
                sena-2xl (24px)
              </div>
            </div>
          </div>

          {/* Espaciado Grande */}
          <div className='p-sena-card-padding bg-white rounded-sena-card shadow-sena-card space-y-sena-sm'>
            <h3 className='text-sena-lg font-sena-heading text-sena-neutral-800'>
              Espaciado Grande
            </h3>
            <div className='space-y-sena-sm'>
              <div className='bg-sena-neutral-200 p-sena-3xl rounded-sena-sm text-center'>
                sena-3xl (32px)
              </div>
              <div className='bg-sena-neutral-300 p-sena-4xl rounded-sena-sm text-center'>
                sena-4xl (40px)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Sizing */}
      <section className='space-y-sena-lg'>
        <h2 className='text-sena-2xl font-sena-heading text-sena-primary-600 border-b border-sena-neutral-200 pb-sena-sm'>
          📐 Tokens de Sizing
        </h2>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-sena-module-gap'>
          {/* Botones */}
          <div className='p-sena-card-padding bg-white rounded-sena-card shadow-sena-card space-y-sena-md'>
            <h3 className='text-sena-lg font-sena-heading text-sena-neutral-800'>Botones</h3>
            <div className='space-y-sena-sm'>
              <button className='w-sena-button-sm h-sena-button-sm px-sena-button-padding-x py-sena-button-padding-y rounded-sena-button bg-sena-primary-500 text-white text-sena-sm'>
                Pequeño
              </button>
              <button className='w-sena-button-md h-sena-button px-sena-button-padding-x py-sena-button-padding-y rounded-sena-button bg-sena-primary-500 text-white'>
                Mediano
              </button>
              <button className='w-sena-button-lg h-sena-button-lg px-sena-button-padding-x py-sena-button-padding-y rounded-sena-button bg-sena-primary-500 text-white text-sena-lg'>
                Grande
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className='p-sena-card-padding bg-white rounded-sena-card shadow-sena-card space-y-sena-md'>
            <h3 className='text-sena-lg font-sena-heading text-sena-neutral-800'>Inputs</h3>
            <div className='space-y-sena-sm'>
              <input
                placeholder='Input pequeño'
                className='w-sena-input-sm h-sena-input-sm px-sena-input-padding-x py-sena-input-padding-y rounded-sena-input border border-sena-neutral-300 text-sena-sm'
              />
              <input
                placeholder='Input mediano'
                className='w-sena-input-md h-sena-input px-sena-input-padding-x py-sena-input-padding-y rounded-sena-input border border-sena-neutral-300'
              />
              <input
                placeholder='Input grande'
                className='w-sena-input-lg h-sena-input-lg px-sena-input-padding-x py-sena-input-padding-y rounded-sena-input border border-sena-neutral-300 text-sena-lg'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Cards */}
      <section className='space-y-sena-lg'>
        <h2 className='text-sena-2xl font-sena-heading text-sena-primary-600 border-b border-sena-neutral-200 pb-sena-sm'>
          🃏 Cards con Diferentes Tamaños
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sena-module-gap'>
          {/* Card Pequeña */}
          <div className='w-sena-card-sm h-sena-card-sm p-sena-card-padding bg-white rounded-sena-card shadow-sena-card'>
            <h3 className='text-sena-md font-sena-heading text-sena-neutral-800 mb-sena-xs'>
              Card Pequeña
            </h3>
            <p className='text-sena-sm text-sena-neutral-600'>256px × 128px</p>
          </div>

          {/* Card Mediana */}
          <div className='w-sena-card-md h-sena-card p-sena-card-padding bg-white rounded-sena-card shadow-sena-card'>
            <h3 className='text-sena-lg font-sena-heading text-sena-neutral-800 mb-sena-sm'>
              Card Mediana
            </h3>
            <p className='text-sena-base text-sena-neutral-600'>320px × 192px</p>
            <div className='mt-sena-md'>
              <span className='inline-block px-sena-sm py-sena-xs bg-sena-primary-100 text-sena-primary-700 rounded-sena-badge text-sena-xs'>
                Etiqueta
              </span>
            </div>
          </div>

          {/* Card Grande */}
          <div className='w-sena-card-lg h-sena-card-lg p-sena-card-padding bg-white rounded-sena-card shadow-sena-card'>
            <h3 className='text-sena-xl font-sena-heading text-sena-neutral-800 mb-sena-md'>
              Card Grande
            </h3>
            <p className='text-sena-base text-sena-neutral-600 mb-sena-lg'>384px × 256px</p>
            <div className='space-y-sena-sm'>
              <div className='w-full h-2 bg-sena-primary-200 rounded-sena-pill'>
                <div className='w-3/4 h-full bg-sena-primary-500 rounded-sena-pill'></div>
              </div>
              <p className='text-sena-sm text-sena-neutral-500'>Progreso: 75%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Sombras y Elevación */}
      <section className='space-y-sena-lg'>
        <h2 className='text-sena-2xl font-sena-heading text-sena-primary-600 border-b border-sena-neutral-200 pb-sena-sm'>
          💫 Sombras y Elevación
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sena-module-gap'>
          <div className='p-sena-card-padding bg-white rounded-sena-card shadow-sena-xs'>
            <h4 className='text-sena-md font-sena-heading mb-sena-xs'>Sombra XS</h4>
            <p className='text-sena-sm text-sena-neutral-600'>shadow-sena-xs</p>
          </div>

          <div className='p-sena-card-padding bg-white rounded-sena-card shadow-sena-sm'>
            <h4 className='text-sena-md font-sena-heading mb-sena-xs'>Sombra SM</h4>
            <p className='text-sena-sm text-sena-neutral-600'>shadow-sena-sm</p>
          </div>

          <div className='p-sena-card-padding bg-white rounded-sena-card shadow-sena-md'>
            <h4 className='text-sena-md font-sena-heading mb-sena-xs'>Sombra MD</h4>
            <p className='text-sena-sm text-sena-neutral-600'>shadow-sena-md</p>
          </div>

          <div className='p-sena-card-padding bg-white rounded-sena-card shadow-sena-lg'>
            <h4 className='text-sena-md font-sena-heading mb-sena-xs'>Sombra LG</h4>
            <p className='text-sena-sm text-sena-neutral-600'>shadow-sena-lg</p>
          </div>
        </div>
      </section>

      {/* Sección de Border Radius */}
      <section className='space-y-sena-lg'>
        <h2 className='text-sena-2xl font-sena-heading text-sena-primary-600 border-b border-sena-neutral-200 pb-sena-sm'>
          🔲 Border Radius
        </h2>

        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-sena-module-gap'>
          <div className='p-sena-md bg-sena-primary-100 rounded-sena-none text-center'>
            <div className='text-sena-xs'>None</div>
          </div>
          <div className='p-sena-md bg-sena-primary-200 rounded-sena-sm text-center'>
            <div className='text-sena-xs'>SM</div>
          </div>
          <div className='p-sena-md bg-sena-primary-300 rounded-sena-md text-center'>
            <div className='text-sena-xs'>MD</div>
          </div>
          <div className='p-sena-md bg-sena-primary-400 rounded-sena-lg text-center'>
            <div className='text-sena-xs'>LG</div>
          </div>
          <div className='p-sena-md bg-sena-primary-500 text-white rounded-sena-xl text-center'>
            <div className='text-sena-xs'>XL</div>
          </div>
          <div className='p-sena-md bg-sena-primary-600 text-white rounded-sena-pill text-center'>
            <div className='text-sena-xs'>Pill</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='text-center p-sena-section-gap border-t border-sena-neutral-200'>
        <div className='space-y-sena-sm'>
          <div className='w-8 h-8 mx-auto bg-sena-primary-500 rounded-sena-avatar'></div>
          <h3 className='text-sena-lg font-sena-heading text-sena-primary-700'>
            ✅ Sistema de Design Tokens SENA
          </h3>
          <p className='text-sena-base text-sena-neutral-600'>
            Implementación completa y funcionando correctamente
          </p>
        </div>
      </footer>
    </div>
  );
}

export default DesignTokensDemo;
