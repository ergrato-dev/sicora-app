import { useState } from 'react';
import { Button } from '../Button';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

/**
 * ButtonPositioningDemo - Ejemplos de posicionamiento correcto de botones
 * Sigue las guías UX/UI de SICORA: botones de acción SIEMPRE a la derecha
 */

export function ButtonPositioningDemo() {
  const [showModal, setShowModal] = useState(false);
  // Estado para futuras expansiones - marcado como usado
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showForm] = useState(false);

  return (
    <div className='space-y-8 p-6 bg-gray-50 min-h-screen'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Ejemplos de Posicionamiento de Botones SICORA
        </h1>
        <p className='text-gray-600 mb-8'>
          Demostración de la regla fundamental:{' '}
          <strong>botones de acción siempre a la derecha</strong>
        </p>

        {/* Ejemplo 1: Lista con acciones */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-4'>📋 Lista de Elementos con Acciones</h2>

          {/* Header de la lista - ✅ CORRECTO */}
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center space-x-4'>
              <h3 className='text-lg font-medium'>Gestión de Usuarios</h3>
              <input
                type='text'
                placeholder='Buscar usuarios...'
                className='px-4 py-2 border border-gray-300 rounded-lg'
              />
            </div>

            {/* ✅ Acciones principales a la derecha */}
            <div className='flex items-center space-x-3'>
              <Button variant='outline' size='sm'>
                <ArrowDownTrayIcon className='w-4 h-4 mr-2' />
                Exportar
              </Button>
              <Button variant='primary' size='sm'>
                <PlusIcon className='w-4 h-4 mr-2' />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          {/* Elementos de la lista */}
          <div className='space-y-3'>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className='flex justify-between items-center p-4 border border-gray-200 rounded-lg'
              >
                <div>
                  <p className='font-medium'>Usuario {item}</p>
                  <p className='text-sm text-gray-600'>usuario{item}@sena.edu.co</p>
                </div>

                {/* ✅ Acciones por fila a la derecha */}
                <div className='flex items-center space-x-2'>
                  <Button variant='ghost' size='sm'>
                    <PencilIcon className='w-4 h-4' />
                  </Button>
                  <Button variant='ghost' size='sm' className='text-red-600 hover:text-red-700'>
                    <TrashIcon className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ejemplo 2: Formulario */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-4'>📝 Formulario con Acciones Correctas</h2>

          <div className='space-y-4 mb-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Nombre completo
              </label>
              <input
                type='text'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                placeholder='Ingresa el nombre'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email institucional
              </label>
              <input
                type='email'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                placeholder='usuario@sena.edu.co'
              />
            </div>
          </div>

          {/* ✅ Acciones del formulario correctamente posicionadas */}
          <div className='flex justify-between items-center pt-6 border-t border-gray-200'>
            {/* Acción destructiva separada a la izquierda */}
            <Button variant='outline' className='text-red-600 border-red-300 hover:bg-red-50'>
              <TrashIcon className='w-4 h-4 mr-2' />
              Limpiar Formulario
            </Button>

            {/* Flujo principal de acciones a la derecha */}
            <div className='flex space-x-3'>
              <Button variant='secondary'>Cancelar</Button>
              <Button variant='outline'>Guardar Borrador</Button>
              <Button variant='primary'>
                <CheckIcon className='w-4 h-4 mr-2' />
                Crear Usuario
              </Button>
            </div>
          </div>
        </div>

        {/* Ejemplo 3: Controles de Modal */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-4'>🪟 Modal y Diálogos</h2>

          <Button variant='primary' onClick={() => setShowModal(true)} className='mb-4'>
            Abrir Modal de Ejemplo
          </Button>

          {showModal && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
              <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
                <h3 className='text-lg font-semibold mb-4'>Confirmar Acción</h3>
                <p className='text-gray-600 mb-6'>
                  ¿Estás seguro de que deseas realizar esta acción? Esta operación no se puede
                  deshacer.
                </p>

                {/* ✅ Footer del modal con botones a la derecha */}
                <div className='flex justify-end space-x-3'>
                  <Button variant='secondary' onClick={() => setShowModal(false)}>
                    <XMarkIcon className='w-4 h-4 mr-2' />
                    Cancelar
                  </Button>
                  <Button variant='primary' onClick={() => setShowModal(false)}>
                    <CheckIcon className='w-4 h-4 mr-2' />
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ejemplo 4: Responsive (Mobile-first) */}
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-semibold mb-4'>📱 Adaptación Mobile</h2>

          <div className='space-y-4 mb-6'>
            <input
              type='text'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              placeholder='Campo de ejemplo'
            />
          </div>

          {/* ✅ Layout adaptativo manteniendo jerarquía */}
          <div className='flex flex-col-reverse sm:flex-row sm:justify-end space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3'>
            <Button variant='secondary' className='w-full sm:w-auto'>
              Cancelar
            </Button>
            <Button variant='primary' className='w-full sm:w-auto'>
              Continuar
            </Button>
          </div>
        </div>

        {/* Guía visual */}
        <div className='bg-sena-primary-50 border border-sena-primary-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-sena-primary-800 mb-3'>
            📏 Reglas de Posicionamiento
          </h3>
          <div className='space-y-2 text-sm text-sena-primary-700'>
            <div className='flex items-center space-x-2'>
              <span className='text-green-600'>✅</span>
              <span>
                <strong>Botón primario:</strong> Siempre en la posición más a la derecha
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-green-600'>✅</span>
              <span>
                <strong>Acciones secundarias:</strong> A la izquierda del primario
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-green-600'>✅</span>
              <span>
                <strong>Cancelar:</strong> A la izquierda de las acciones positivas
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-green-600'>✅</span>
              <span>
                <strong>Destructivas:</strong> Separadas con espacio extra
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-red-600'>❌</span>
              <span>
                <strong>NUNCA:</strong> Colocar el botón principal a la izquierda
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ButtonPositioningDemo;
