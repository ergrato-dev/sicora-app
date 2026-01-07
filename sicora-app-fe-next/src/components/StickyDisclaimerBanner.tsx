import { useEffect, useState } from 'react';

/**
 * Banner pegajoso de disclaimer para builds de EPTI
 */
interface StickyDisclaimerBannerProps {
  className?: string;
}

export function StickyDisclaimerBanner({ className }: StickyDisclaimerBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya había cerrado el banner
    const dismissed = localStorage.getItem('epti-disclaimer-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Solo mostrar en builds de EPTI
  const IS_SENA_BUILD = false;
  if (IS_SENA_BUILD || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('epti-disclaimer-dismissed', 'true');
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      className={`sticky top-0 z-50 bg-orange-500 border-b-2 border-orange-400 shadow-sm ${className || ''}`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className={`transition-all duration-300 ease-in-out ${isMinimized ? 'py-2' : 'py-4'}`}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3 flex-1'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
                  <span className='text-orange-600 text-lg font-bold'>⚠</span>
                </div>
              </div>

              <div className='flex-1'>
                {!isMinimized ? (
                  <div className='space-y-1'>
                    <h3 className='text-white font-bold text-sm sm:text-base'>
                      🔒 SICORA - Entorno de Demostración
                    </h3>
                    <p className='text-orange-100 text-xs sm:text-sm'>
                      <strong>IMPORTANTE:</strong> Todos los datos son sintéticos y ficticios.
                    </p>
                  </div>
                ) : (
                  <span className='text-white text-sm font-medium'>🔒 Demo - Datos ficticios</span>
                )}
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <button
                onClick={handleMinimize}
                className='text-white hover:text-orange-100 p-1 rounded transition-colors'
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                {isMinimized ? '⬆' : '⬇'}
              </button>
              <button
                onClick={handleDismiss}
                className='text-white hover:text-orange-100 p-1 rounded transition-colors ml-2'
                title='Cerrar'
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StickyDisclaimerBanner;
