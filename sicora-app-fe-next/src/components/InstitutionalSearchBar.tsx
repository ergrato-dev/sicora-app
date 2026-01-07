import { useState } from 'react';
import { cn } from '../utils/cn';
import type { SearchOption } from '../constants/searchOptions';

/**
 * InstitutionalSearchBar - Buscador estilo SofiaPlus
 * Inspirado en "¿Qué le gustaría estudiar?" de la oferta educativa SENA
 */

interface InstitutionalSearchBarProps {
  /** Placeholder principal */
  placeholder?: string;
  /** Título de la sección */
  title?: string;
  /** Subtítulo descriptivo */
  subtitle?: string;
  /** Opciones de búsqueda sugeridas */
  suggestions?: SearchOption[];
  /** Callback cuando se realiza búsqueda */
  onSearch?: (query: string, filters?: Record<string, unknown>) => void;
  /** Mostrar filtros adicionales */
  showFilters?: boolean;
  /** Estilo del componente */
  variant?: 'default' | 'compact' | 'hero';
  /** Clase CSS adicional */
  className?: string;
}

export function InstitutionalSearchBar({
  placeholder = 'Buscar en SICORA...',
  title = '¿Qué necesita encontrar?',
  subtitle = 'Busque usuarios, horarios, evaluaciones o cualquier información del sistema',
  suggestions = [],
  onSearch,
  showFilters = true,
  variant = 'default',
  className,
}: InstitutionalSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    type: 'all',
    scope: 'all',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, selectedFilters);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isHeroVariant = variant === 'hero';
  const isCompactVariant = variant === 'compact';

  return (
    <div
      className={cn(
        'w-full',
        isHeroVariant &&
          'bg-gradient-to-r from-sena-primary-500 to-sena-primary-600 text-white py-12',
        className
      )}
    >
      <div className={cn('max-w-4xl mx-auto', isHeroVariant ? 'px-4 sm:px-6 lg:px-8' : 'px-4')}>
        {/* Título y subtítulo */}
        {!isCompactVariant && (
          <div className='text-center mb-8'>
            <h2
              className={cn(
                'text-2xl font-sena-heading font-bold mb-3',
                isHeroVariant ? 'text-white' : 'text-gray-900'
              )}
            >
              {title}
            </h2>
            <p
              className={cn(
                'text-lg font-sena-body',
                isHeroVariant ? 'text-blue-100' : 'text-gray-600'
              )}
            >
              {subtitle}
            </p>
          </div>
        )}

        {/* Área de búsqueda principal */}
        <div className='relative'>
          <div
            className={cn(
              'flex rounded-lg shadow-lg overflow-hidden',
              isHeroVariant ? 'bg-white' : 'bg-white border border-gray-300'
            )}
          >
            {/* Campo de búsqueda */}
            <div className='flex-1 relative'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                placeholder={placeholder}
                className={cn(
                  'w-full px-4 py-4 text-lg font-sena-body border-0 focus:outline-none focus:ring-0',
                  'placeholder-gray-500 text-gray-900'
                )}
              />

              {/* Sugerencias */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className='absolute top-full left-0 right-0 bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-lg z-10 max-h-64 overflow-y-auto'>
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion.label);
                        setShowSuggestions(false);
                        handleSearch();
                      }}
                      className='w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center space-x-3'
                    >
                      {suggestion.icon && <span className='text-xl'>{suggestion.icon}</span>}
                      <div>
                        <span className='text-gray-900 font-medium'>{suggestion.label}</span>
                        {suggestion.category && (
                          <span className='text-gray-500 text-sm block'>{suggestion.category}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Botón de búsqueda */}
            <button
              onClick={handleSearch}
              className={cn(
                'px-8 py-4 font-sena-body font-medium text-white transition-colors',
                'bg-sena-secondary-500 hover:bg-sena-secondary-600 focus:outline-none focus:ring-2 focus:ring-sena-secondary-300'
              )}
            >
              <span className='hidden sm:inline'>Buscar</span>
              <span className='sm:hidden'>🔍</span>
            </button>
          </div>
        </div>

        {/* Filtros adicionales */}
        {showFilters && !isCompactVariant && (
          <div className='mt-6 flex flex-wrap gap-4 justify-center'>
            {/* Tipo de búsqueda */}
            <div className='flex items-center space-x-2'>
              <label
                className={cn(
                  'text-sm font-medium',
                  isHeroVariant ? 'text-blue-100' : 'text-gray-700'
                )}
              >
                Buscar en:
              </label>
              <select
                value={selectedFilters.type}
                onChange={(e) => setSelectedFilters((prev) => ({ ...prev, type: e.target.value }))}
                className='rounded-md border-gray-300 text-sm font-sena-body focus:border-sena-primary-500 focus:ring-sena-primary-500'
              >
                <option value='all'>Todo el sistema</option>
                <option value='users'>Usuarios</option>
                <option value='schedules'>Horarios</option>
                <option value='attendance'>Asistencia</option>
                <option value='evaluations'>Evaluaciones</option>
                <option value='projects'>Proyectos</option>
              </select>
            </div>

            {/* Ámbito */}
            <div className='flex items-center space-x-2'>
              <label
                className={cn(
                  'text-sm font-medium',
                  isHeroVariant ? 'text-blue-100' : 'text-gray-700'
                )}
              >
                Ámbito:
              </label>
              <select
                value={selectedFilters.scope}
                onChange={(e) => setSelectedFilters((prev) => ({ ...prev, scope: e.target.value }))}
                className='rounded-md border-gray-300 text-sm font-sena-body focus:border-sena-primary-500 focus:ring-sena-primary-500'
              >
                <option value='all'>Todas las coordinaciones</option>
                <option value='my-coordination'>Mi coordinación</option>
                <option value='cgmlti'>Solo CGMLTI</option>
              </select>
            </div>
          </div>
        )}

        {/* Sugerencias rápidas */}
        {!isCompactVariant && suggestions.length > 0 && (
          <div className='mt-6 text-center'>
            <p
              className={cn(
                'text-sm font-medium mb-3',
                isHeroVariant ? 'text-blue-100' : 'text-gray-700'
              )}
            >
              Búsquedas frecuentes:
            </p>
            <div className='flex flex-wrap gap-2 justify-center'>
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(suggestion.label);
                    handleSearch();
                  }}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    isHeroVariant
                      ? 'bg-blue-500 text-white hover:bg-blue-400'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  )}
                >
                  {suggestion.icon && <span className='mr-1'>{suggestion.icon}</span>}
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
