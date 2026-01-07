import React, { useState } from 'react';
import {
  Spinner,
  ProgressSpinner,
  PulseSpinner,
  DotsSpinner,
  SpinnerWithText,
} from '../ui/Spinner';
import { SimpleTooltip, IconTooltip, HelpTooltip, TooltipProvider } from '../ui/Tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from '../ui/DropdownMenu';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const SpinnerTooltipDropdownDemoPage: React.FC = () => {
  const [progress, setProgress] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSort, setSelectedSort] = useState('name');
  const [showNotifications, setShowNotifications] = useState(true);
  const [showEmails, setShowEmails] = useState(false);

  const handleSimulateProgress = () => {
    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <TooltipProvider>
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='mx-auto max-w-7xl'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Spinner, Tooltip & Dropdown Components
            </h1>
            <p className='text-gray-600'>
              Demostración de indicadores de carga, información contextual y menús interactivos
            </p>
          </div>

          <div className='space-y-8'>
            {/* Spinner Components Section */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                Indicadores de Carga (Spinners)
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {/* Basic Spinners */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-4'>Spinner Básico</h3>
                  <div className='space-y-4'>
                    <div className='flex items-center space-x-4'>
                      <Spinner size='xs' variant='default' />
                      <Spinner size='sm' variant='primary' />
                      <Spinner size='default' variant='secondary' />
                      <Spinner size='lg' variant='primary' />
                      <Spinner size='xl' variant='default' />
                    </div>

                    <div className='flex items-center space-x-4'>
                      <Spinner variant='white' className='bg-gray-800 p-2 rounded' />
                      <Spinner variant='dark' />
                      <Spinner speed='slow' />
                      <Spinner speed='fast' />
                    </div>
                  </div>
                </div>

                {/* Progress Spinner */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-4'>Spinner de Progreso</h3>
                  <div className='space-y-4'>
                    <div className='flex items-center space-x-4'>
                      <ProgressSpinner
                        progress={progress}
                        size='sm'
                        variant='primary'
                        showPercentage
                      />
                      <ProgressSpinner progress={progress} size='default' variant='success' />
                      <ProgressSpinner
                        progress={progress}
                        size='lg'
                        variant='warning'
                        showPercentage
                      />
                    </div>

                    <div className='space-y-2'>
                      <Button
                        variant='primary'
                        size='sm'
                        onClick={handleSimulateProgress}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Procesando...' : 'Simular Progreso'}
                      </Button>
                      <input
                        type='range'
                        min='0'
                        max='100'
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className='w-full'
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Alternative Spinners */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-4'>Spinners Alternativos</h3>
                  <div className='space-y-4'>
                    <div className='flex items-center space-x-4'>
                      <PulseSpinner size='sm' variant='primary' />
                      <PulseSpinner size='default' variant='secondary' />
                      <PulseSpinner size='lg' variant='success' />
                    </div>

                    <div className='flex items-center space-x-4'>
                      <DotsSpinner size='sm' variant='primary' dotCount={3} />
                      <DotsSpinner size='default' variant='warning' dotCount={4} />
                      <DotsSpinner size='lg' variant='danger' dotCount={5} />
                    </div>

                    <div className='space-y-2'>
                      <SpinnerWithText
                        text='Cargando datos...'
                        textPosition='right'
                        size='sm'
                        variant='primary'
                      />
                      <SpinnerWithText
                        text='Procesando solicitud...'
                        textPosition='below'
                        size='default'
                        variant='secondary'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tooltip Components Section */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6'>Tooltips Informativos</h2>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {/* Basic Tooltips */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-4'>Tooltips Básicos</h3>
                  <div className='space-y-4'>
                    <div className='flex flex-wrap gap-3'>
                      <SimpleTooltip content='Tooltip por defecto' side='top'>
                        <Button variant='outline' size='sm'>
                          Top
                        </Button>
                      </SimpleTooltip>

                      <SimpleTooltip content='Tooltip a la derecha' side='right'>
                        <Button variant='outline' size='sm'>
                          Right
                        </Button>
                      </SimpleTooltip>

                      <SimpleTooltip content='Tooltip abajo' side='bottom'>
                        <Button variant='outline' size='sm'>
                          Bottom
                        </Button>
                      </SimpleTooltip>

                      <SimpleTooltip content='Tooltip a la izquierda' side='left'>
                        <Button variant='outline' size='sm'>
                          Left
                        </Button>
                      </SimpleTooltip>
                    </div>

                    <div className='flex flex-wrap gap-3'>
                      <SimpleTooltip content='Tooltip primario' variant='primary'>
                        <Button variant='primary' size='sm'>
                          Primary
                        </Button>
                      </SimpleTooltip>

                      <SimpleTooltip content='Tooltip de éxito' variant='success'>
                        <Button variant='success' size='sm'>
                          Success
                        </Button>
                      </SimpleTooltip>

                      <SimpleTooltip content='Tooltip de advertencia' variant='warning'>
                        <Button variant='warning' size='sm'>
                          Warning
                        </Button>
                      </SimpleTooltip>

                      <SimpleTooltip content='Tooltip de error' variant='danger'>
                        <Button variant='danger' size='sm'>
                          Danger
                        </Button>
                      </SimpleTooltip>
                    </div>
                  </div>
                </div>

                {/* Icon Tooltips */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-4'>Tooltips con Iconos</h3>
                  <div className='space-y-4'>
                    <div className='flex items-center space-x-3'>
                      <span>Configuración</span>
                      <IconTooltip
                        icon={
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                            <path
                              fillRule='evenodd'
                              d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
                              clipRule='evenodd'
                            />
                          </svg>
                        }
                        content='Abrir configuración del sistema'
                        label='Abrir configuración del sistema'
                        variant='light'
                      />
                    </div>

                    <div className='flex items-center space-x-3'>
                      <span>Notificaciones</span>
                      <IconTooltip
                        icon={
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z' />
                          </svg>
                        }
                        content='Ver todas las notificaciones pendientes'
                        label='Ver todas las notificaciones pendientes'
                        variant='primary'
                      />
                    </div>

                    <div className='flex items-center space-x-3'>
                      <span>Ayuda</span>
                      <IconTooltip
                        icon={
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                            <path
                              fillRule='evenodd'
                              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z'
                              clipRule='evenodd'
                            />
                          </svg>
                        }
                        content='Obtener ayuda sobre esta funcionalidad'
                        label='Obtener ayuda sobre esta funcionalidad'
                        variant='info'
                      />
                    </div>
                  </div>
                </div>

                {/* Form Tooltips */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-4'>
                    Tooltips en Formularios
                  </h3>
                  <div className='space-y-4'>
                    <div className='space-y-3'>
                      <div className='flex items-center'>
                        <label className='text-sm font-medium text-gray-700'>
                          Nombre de usuario
                        </label>
                        <HelpTooltip
                          content='El nombre de usuario debe tener entre 3 y 20 caracteres, solo letras, números y guiones bajos.'
                          helpText='El nombre de usuario debe tener entre 3 y 20 caracteres, solo letras, números y guiones bajos.'
                        />
                      </div>
                      <Input placeholder='Ingresa tu nombre de usuario' />
                    </div>

                    <div className='space-y-3'>
                      <div className='flex items-center'>
                        <label className='text-sm font-medium text-gray-700'>Contraseña</label>
                        <HelpTooltip
                          content='La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.'
                          helpText='La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.'
                        />
                      </div>
                      <Input type='password' placeholder='Ingresa tu contraseña' />
                    </div>

                    <div className='space-y-3'>
                      <div className='flex items-center'>
                        <label className='text-sm font-medium text-gray-700'>
                          Email institucional
                        </label>
                        <HelpTooltip
                          content='Usa tu email institucional del SENA para acceder a todas las funcionalidades.'
                          helpText='Usa tu email institucional del SENA para acceder a todas las funcionalidades.'
                        />
                      </div>
                      <Input type='email' placeholder='ejemplo@sena.edu.co' />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dropdown Menu Section */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                Menús Desplegables (Dropdown)
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {/* Basic Dropdown */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-4'>Menú Básico</h3>
                  <div className='space-y-4'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline'>Acciones</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Ver perfil
                          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Configuración
                          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Equipo</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant='destructive'>
                          Cerrar sesión
                          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='primary'>Usuario</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent variant='primary'>
                        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Historial</DropdownMenuItem>
                        <DropdownMenuItem>Favoritos</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Checkbox Dropdown */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-4'>Menú con Checkboxes</h3>
                  <div className='space-y-4'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline'>Notificaciones</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Configurar notificaciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={showNotifications}
                          onCheckedChange={setShowNotifications}
                        >
                          Notificaciones push
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={showEmails}
                          onCheckedChange={setShowEmails}
                        >
                          Notificaciones por email
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={false}>
                          Notificaciones SMS
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className='text-xs text-gray-500 space-y-1'>
                      <div>Notificaciones: {showNotifications ? 'Activadas' : 'Desactivadas'}</div>
                      <div>Emails: {showEmails ? 'Activados' : 'Desactivados'}</div>
                    </div>
                  </div>
                </div>

                {/* Radio Dropdown */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-4'>Menú con Radio</h3>
                  <div className='space-y-4'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline'>Ordenar por: {selectedSort}</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          value={selectedSort}
                          onValueChange={setSelectedSort}
                        >
                          <DropdownMenuRadioItem value='name'>Nombre</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value='date'>Fecha</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value='size'>Tamaño</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value='type'>Tipo</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline'>Más opciones</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <svg className='mr-2 h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                            <path d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' />
                          </svg>
                          <span>Exportar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <svg className='mr-2 h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                            <path
                              fillRule='evenodd'
                              d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <span>Descargar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <svg className='mr-2 h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z'
                                clipRule='evenodd'
                              />
                            </svg>
                            <span>Compartir</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem>Email</DropdownMenuItem>
                            <DropdownMenuItem>Enlace</DropdownMenuItem>
                            <DropdownMenuItem>Redes sociales</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SpinnerTooltipDropdownDemoPage;
