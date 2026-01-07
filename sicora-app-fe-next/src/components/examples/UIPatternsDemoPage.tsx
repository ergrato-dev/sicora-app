import { Button } from '../ui/Button';
import { ButtonGroup, ButtonGroupStandard, ButtonGroupActions } from '../ui/ButtonGroup';
import { BRAND_CONFIG } from '../../config/brand';
import {
  PlusIcon,
  DocumentIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

/**
 * UIPatternsDemoPage - Demostración de patrones UX/UI institucionales SENA
 */
export function UIPatternsDemoPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Guías UX/UI Institucional</h1>
              <p className='mt-2 text-base text-gray-600'>
                Patrones y componentes siguiendo la identidad {BRAND_CONFIG.name}
              </p>
            </div>
            <Button variant='primary' size='lg' leftIcon={<DocumentIcon className='h-5 w-5' />}>
              Documentación
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <ButtonPatternsDemo />
      </div>
    </div>
  );
}

/**
 * ButtonPatternsDemo - Demostración de patrones de botones
 */
function ButtonPatternsDemo() {
  return (
    <div className='space-y-12'>
      {/* Jerarquía de Botones */}
      <section>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>Jerarquía de Botones</h2>
        <div className='bg-white rounded-lg p-6 border border-gray-200'>
          <h3 className='text-lg font-medium text-gray-700 mb-4'>Variantes</h3>
          <div className='space-y-4'>
            <ButtonGroup spacing='md' className='flex-wrap'>
              <Button variant='primary'>Primario</Button>
              <Button variant='secondary'>Secundario</Button>
              <Button variant='outline'>Outline</Button>
              <Button variant='ghost'>Ghost</Button>
            </ButtonGroup>
          </div>
        </div>
      </section>

      {/* Patrones de Agrupación */}
      <section>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>Patrones de Agrupación</h2>

        <div className='space-y-6'>
          {/* Formulario Estándar */}
          <div className='bg-white rounded-lg p-6 border border-gray-200'>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>Formulario Estándar</h3>
            <ButtonGroupStandard
              secondaryButtons={
                <>
                  <Button variant='outline'>Cancelar</Button>
                  <Button variant='ghost'>Vista Previa</Button>
                </>
              }
              primaryButton={<Button variant='primary'>Guardar Usuario</Button>}
            />
          </div>

          {/* Acciones de Lista */}
          <div className='bg-white rounded-lg p-6 border border-gray-200'>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>Acciones de Lista</h3>
            <div className='flex justify-between items-center p-4 bg-gray-50 rounded'>
              <span className='text-sm text-gray-600'>Juan Pérez - Instructor</span>
              <ButtonGroupActions>
                <Button variant='ghost' size='sm' leftIcon={<EyeIcon className='h-4 w-4' />}>
                  Ver
                </Button>
                <Button variant='ghost' size='sm' leftIcon={<PencilIcon className='h-4 w-4' />}>
                  Editar
                </Button>
                <Button variant='ghost' size='sm' leftIcon={<TrashIcon className='h-4 w-4' />}>
                  Eliminar
                </Button>
              </ButtonGroupActions>
            </div>
          </div>
        </div>
      </section>

      {/* Estados */}
      <section>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>Estados de Botones</h2>
        <div className='bg-white rounded-lg p-6 border border-gray-200'>
          <div className='space-y-4'>
            <ButtonGroup spacing='md'>
              <Button variant='primary'>Normal</Button>
              <Button variant='primary' loading>
                Cargando
              </Button>
              <Button variant='primary' disabled>
                Deshabilitado
              </Button>
            </ButtonGroup>

            <ButtonGroup spacing='md'>
              <Button variant='primary' leftIcon={<PlusIcon className='h-4 w-4' />}>
                Con Ícono Izquierdo
              </Button>
              <Button variant='primary' rightIcon={<PlusIcon className='h-4 w-4' />}>
                Con Ícono Derecho
              </Button>
            </ButtonGroup>

            <Button variant='primary' fullWidth>
              Ancho Completo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
