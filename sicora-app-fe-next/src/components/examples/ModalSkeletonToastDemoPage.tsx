import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from '../ui/Skeleton';
import { ToastProvider, ToastViewport } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { useToast } from '../../hooks/useToast';

const ModalSkeletonToastDemoPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const { toast } = useToast();

  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Carga completada',
        description: 'Los datos se han cargado exitosamente.',
        variant: 'success',
      });
    }, 3000);
  };

  const handleShowToast = (variant: 'default' | 'success' | 'warning' | 'danger' | 'info') => {
    const messages = {
      default: { title: 'Notificación', description: 'Esta es una notificación estándar.' },
      success: { title: '¡Éxito!', description: 'La operación se completó correctamente.' },
      warning: { title: 'Advertencia', description: 'Ten cuidado con esta acción.' },
      danger: { title: 'Error', description: 'Algo salió mal. Por favor, inténtalo de nuevo.' },
      info: { title: 'Información', description: 'Aquí tienes información importante.' },
    };

    toast({
      title: messages[variant].title,
      description: messages[variant].description,
      variant,
    });
  };

  const handleSubmitForm = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, completa todos los campos requeridos.',
        variant: 'danger',
      });
      return;
    }

    toast({
      title: 'Formulario enviado',
      description: `Gracias ${formData.name}, hemos recibido tu mensaje.`,
      variant: 'success',
    });

    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <ToastProvider>
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='mx-auto max-w-7xl'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Modal, Skeleton & Toast Components
            </h1>
            <p className='text-gray-600'>
              Demostración de componentes avanzados: Modales accesibles, estados de carga y
              notificaciones
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Modal & Dialog Section */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>Modales y Diálogos</h2>

              <div className='space-y-4'>
                {/* Basic Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline'>Abrir Modal Básico</Button>
                  </DialogTrigger>
                  <DialogContent size='default'>
                    <DialogHeader>
                      <DialogTitle>Confirmación</DialogTitle>
                      <DialogDescription>
                        ¿Estás seguro de que deseas continuar con esta acción?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant='outline' size='sm'>
                        Cancelar
                      </Button>
                      <Button variant='primary' size='sm'>
                        Confirmar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Form Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='primary'>Modal con Formulario</Button>
                  </DialogTrigger>
                  <DialogContent size='lg'>
                    <DialogHeader>
                      <DialogTitle>Contacto</DialogTitle>
                      <DialogDescription>
                        Completa el formulario para enviar tu mensaje
                      </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4 py-4'>
                      <Input
                        label='Nombre completo'
                        placeholder='Ingresa tu nombre'
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Input
                        type='email'
                        label='Correo electrónico'
                        placeholder='tu@email.com'
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        required
                      />
                      <TextArea
                        label='Mensaje'
                        placeholder='Escribe tu mensaje aquí...'
                        value={formData.message}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, message: e.target.value }))
                        }
                        rows={4}
                      />
                    </div>

                    <DialogFooter>
                      <Button variant='outline' size='sm'>
                        Cancelar
                      </Button>
                      <Button variant='primary' size='sm' onClick={handleSubmitForm}>
                        Enviar Mensaje
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Destructive Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='danger'>Modal Destructivo</Button>
                  </DialogTrigger>
                  <DialogContent size='sm'>
                    <DialogHeader>
                      <DialogTitle>Eliminar elemento</DialogTitle>
                      <DialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el elemento
                        seleccionado.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant='outline' size='sm'>
                        Cancelar
                      </Button>
                      <Button
                        variant='danger'
                        size='sm'
                        onClick={() =>
                          toast({
                            title: 'Elemento eliminado',
                            description: 'El elemento ha sido eliminado correctamente.',
                            variant: 'success',
                          })
                        }
                      >
                        Eliminar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Toast Notifications Section */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>Notificaciones Toast</h2>

              <div className='grid grid-cols-2 gap-3'>
                <Button variant='outline' size='sm' onClick={() => handleShowToast('default')}>
                  Default
                </Button>
                <Button variant='primary' size='sm' onClick={() => handleShowToast('success')}>
                  Success
                </Button>
                <Button variant='warning' size='sm' onClick={() => handleShowToast('warning')}>
                  Warning
                </Button>
                <Button variant='danger' size='sm' onClick={() => handleShowToast('danger')}>
                  Error
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleShowToast('info')}
                  className='col-span-2'
                >
                  Info
                </Button>
              </div>
            </div>

            {/* Skeleton Loading States Section */}
            <div className='bg-white rounded-lg shadow-sm border p-6 lg:col-span-2'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold text-gray-900'>Estados de Carga (Skeleton)</h2>
                <Button
                  variant={isLoading ? 'outline' : 'primary'}
                  size='sm'
                  onClick={handleSimulateLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Cargando...' : 'Simular Carga'}
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {/* Basic Skeleton Examples */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-3'>Skeleton Básico</h3>
                  <div className='space-y-3'>
                    {isLoading ? (
                      <>
                        <Skeleton variant='default' shape='rounded' height={20} />
                        <Skeleton variant='default' shape='rounded' height={20} width='80%' />
                        <Skeleton variant='default' shape='rounded' height={20} width='60%' />
                      </>
                    ) : (
                      <>
                        <div className='h-5 bg-gray-200 rounded'>Línea de texto completa</div>
                        <div className='h-5 bg-gray-200 rounded w-4/5'>Línea de texto</div>
                        <div className='h-5 bg-gray-200 rounded w-3/5'>Texto corto</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Text Skeleton */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-3'>Skeleton de Texto</h3>
                  {isLoading ? (
                    <SkeletonText lines={4} spacing='normal' />
                  ) : (
                    <div className='space-y-2 text-sm text-gray-600'>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <p>Sed do eiusmod tempor incididunt ut labore.</p>
                      <p>Duis aute irure dolor in reprehenderit in voluptate.</p>
                      <p>Excepteur sint occaecat cupidatat non proident.</p>
                    </div>
                  )}
                </div>

                {/* Card Skeleton */}
                <div>
                  <h3 className='text-sm font-medium text-gray-700 mb-3'>Skeleton de Tarjeta</h3>
                  {isLoading ? (
                    <SkeletonCard />
                  ) : (
                    <div className='border rounded-lg p-4'>
                      <div className='flex items-center space-x-3 mb-3'>
                        <div className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold'>
                          U
                        </div>
                        <div>
                          <div className='font-medium text-gray-900'>Usuario Demo</div>
                          <div className='text-sm text-gray-500'>Administrador</div>
                        </div>
                      </div>
                      <p className='text-sm text-gray-600'>
                        Esta es una tarjeta de ejemplo con contenido real.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Skeleton */}
              <div className='mt-8'>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>Skeleton de Tabla</h3>
                {isLoading ? (
                  <SkeletonTable rows={4} columns={4} />
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Nombre
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Email
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Rol
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        <tr>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            Juan Pérez
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            juan@ejemplo.com
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            Instructor
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                              Activo
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            María García
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            maria@ejemplo.com
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            Coordinador
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                              Activo
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastViewport />
    </ToastProvider>
  );
};

export default ModalSkeletonToastDemoPage;
