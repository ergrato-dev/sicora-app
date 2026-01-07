import React from 'react';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';

export const SelectBadgeAlertDemoPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('');
  const [tags, setTags] = React.useState(['React', 'TypeScript', 'TailwindCSS']);
  const [alerts, setAlerts] = React.useState([
    { id: 1, type: 'success', show: true },
    { id: 2, type: 'warning', show: true },
    { id: 3, type: 'danger', show: true },
  ]);

  const countryOptions = [
    { value: 'co', label: 'Colombia' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' },
    { value: 'cl', label: 'Chile' },
    { value: 'pe', label: 'Perú' },
    { value: 'ec', label: 'Ecuador' },
  ];

  const roleOptions = [
    { value: 'instructor', label: 'Instructor' },
    { value: 'aprendiz', label: 'Aprendiz' },
    { value: 'coordinador', label: 'Coordinador Académico' },
    { value: 'admin', label: 'Administrador' },
    { value: 'invitado', label: 'Invitado', disabled: true },
  ];

  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'pending', label: 'Pendiente' },
  ];

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const closeAlert = (alertId: number) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, show: false } : alert)));
  };

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-8'>
      {/* Header */}
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-bold text-sena-primary'>
          Select, Badge & Alert Components - Fase 1.4 Día 2
        </h1>
        <p className='text-gray-600 text-lg'>
          Demo de componentes de selección, estados y notificaciones
        </p>
      </div>

      {/* Select Components */}
      <div className='space-y-6'>
        <h2 className='text-2xl font-semibold text-sena-primary border-b border-sena-light pb-2'>
          Select Components
        </h2>

        <div className='grid md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Selectores Básicos</h3>

            <Select
              label='País de Residencia'
              placeholder='Selecciona tu país...'
              options={countryOptions}
              value={selectedCountry}
              onValueChange={setSelectedCountry}
              helperText='Esto ayuda a personalizar tu experiencia'
              isRequired
            />

            <Select
              label='Rol en SENA'
              placeholder='Selecciona tu rol...'
              options={roleOptions}
              value={selectedRole}
              onValueChange={setSelectedRole}
              helperText='Define tus permisos en el sistema'
              isRequired
            />

            <Select
              label='Estado con Error'
              placeholder='Selecciona un estado...'
              options={statusOptions}
              errorMessage='Debes seleccionar un estado válido'
            />
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Variantes y Estados</h3>

            <Select
              label='Select con Éxito'
              placeholder='Estado exitoso...'
              options={statusOptions}
              value='active'
              successMessage='Configuración guardada correctamente'
            />

            <Select
              label='Select Deshabilitado'
              placeholder='No disponible...'
              options={statusOptions}
              disabled
              helperText='Esta opción no está disponible actualmente'
            />

            <div className='grid grid-cols-3 gap-2'>
              <div>
                <label className='block text-sm font-medium mb-1'>Pequeño</label>
                <Select
                  size='sm'
                  options={[{ value: 'sm', label: 'Pequeño' }]}
                  placeholder='Pequeño...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Normal</label>
                <Select
                  size='default'
                  options={[{ value: 'def', label: 'Normal' }]}
                  placeholder='Normal...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Grande</label>
                <Select
                  size='lg'
                  options={[{ value: 'lg', label: 'Grande' }]}
                  placeholder='Grande...'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Components */}
      <div className='space-y-6'>
        <h2 className='text-2xl font-semibold text-sena-primary border-b border-sena-light pb-2'>
          Badge Components
        </h2>

        <div className='grid md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Variantes de Estado</h3>

            <div className='flex flex-wrap gap-2'>
              <Badge variant='default'>Por Defecto</Badge>
              <Badge variant='primary'>Primario SENA</Badge>
              <Badge variant='secondary'>Secundario</Badge>
              <Badge variant='tertiary'>Terciario</Badge>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Badge variant='success'>Éxito</Badge>
              <Badge variant='warning'>Advertencia</Badge>
              <Badge variant='danger'>Peligro</Badge>
              <Badge variant='info'>Información</Badge>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>Outline</Badge>
              <Badge variant='outline-primary'>Outline Primario</Badge>
              <Badge variant='outline-success'>Outline Éxito</Badge>
              <Badge variant='outline-danger'>Outline Peligro</Badge>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Tamaños y Funcionalidad</h3>

            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <span className='text-sm'>Tamaños:</span>
                <Badge size='sm' variant='primary'>
                  Pequeño
                </Badge>
                <Badge size='default' variant='primary'>
                  Normal
                </Badge>
                <Badge size='lg' variant='primary'>
                  Grande
                </Badge>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-sm'>Con iconos:</span>
                <Badge
                  variant='success'
                  leftIcon={
                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  }
                >
                  Completado
                </Badge>
                <Badge
                  variant='warning'
                  rightIcon={
                    <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  }
                >
                  Pendiente
                </Badge>
              </div>

              <div className='space-y-2'>
                <span className='text-sm'>Tags removibles:</span>
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant='outline-primary'
                      removable
                      onRemove={() => removeTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-sm'>Interactivos:</span>
                <Badge variant='primary' interactive onClick={() => alert('Badge clickeado!')}>
                  Clickeable
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Components */}
      <div className='space-y-6'>
        <h2 className='text-2xl font-semibold text-sena-primary border-b border-sena-light pb-2'>
          Alert Components
        </h2>

        <div className='space-y-4'>
          <h3 className='text-lg font-medium'>Alertas de Sistema</h3>

          <div className='space-y-4'>
            {alerts.find((a) => a.id === 1)?.show && (
              <Alert
                variant='success'
                title='¡Operación Exitosa!'
                description='Los datos se han guardado correctamente en el sistema.'
                closable
                onClose={() => closeAlert(1)}
              />
            )}

            {alerts.find((a) => a.id === 2)?.show && (
              <Alert
                variant='warning'
                title='Atención Requerida'
                description='Algunos campos requieren revisión antes de continuar.'
                closable
                onClose={() => closeAlert(2)}
              />
            )}

            {alerts.find((a) => a.id === 3)?.show && (
              <Alert
                variant='danger'
                title='Error de Validación'
                description='Se encontraron errores en el formulario. Por favor revisa los campos marcados.'
                closable
                onClose={() => closeAlert(3)}
              />
            )}

            <Alert
              variant='info'
              title='Información del Sistema'
              description='El mantenimiento programado se realizará el próximo domingo de 2:00 AM a 4:00 AM.'
            />

            <Alert
              variant='primary'
              title='Novedad SENA'
              description='Nueva funcionalidad disponible: Evaluaciones en línea con seguimiento en tiempo real.'
            />

            <Alert variant='default'>
              <strong>Recordatorio:</strong> No olvides completar tu perfil institucional para
              acceder a todas las funcionalidades.
            </Alert>
          </div>

          <div className='grid md:grid-cols-3 gap-4'>
            <Alert
              variant='success'
              size='sm'
              title='Pequeña'
              description='Alerta de tamaño pequeño'
            />
            <Alert
              variant='warning'
              size='default'
              title='Normal'
              description='Alerta de tamaño normal'
            />
            <Alert
              variant='danger'
              size='lg'
              title='Grande'
              description='Alerta de tamaño grande con más contenido y espaciado'
            />
          </div>
        </div>
      </div>

      {/* Integration Example */}
      <div className='bg-gray-50 rounded-lg p-6 space-y-4'>
        <h2 className='text-xl font-semibold text-sena-primary'>Ejemplo de Integración</h2>

        <div className='grid md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <Select
              label='Selecciona tu Rol'
              options={roleOptions}
              value={selectedRole}
              onValueChange={setSelectedRole}
              placeholder='Elige un rol...'
            />

            <Select
              label='País de Origen'
              options={countryOptions}
              value={selectedCountry}
              onValueChange={setSelectedCountry}
              placeholder='Elige tu país...'
            />
          </div>

          <div className='space-y-4'>
            <div>
              <span className='text-sm font-medium block mb-2'>Estado Actual:</span>
              <div className='flex gap-2'>
                {selectedRole && (
                  <Badge variant='primary'>
                    Rol: {roleOptions.find((r) => r.value === selectedRole)?.label}
                  </Badge>
                )}
                {selectedCountry && (
                  <Badge variant='secondary'>
                    País: {countryOptions.find((c) => c.value === selectedCountry)?.label}
                  </Badge>
                )}
              </div>
            </div>

            {selectedRole && selectedCountry && (
              <Alert
                variant='success'
                title='Perfil Completo'
                description='Tu perfil institucional está completo y listo para usar.'
              />
            )}
          </div>
        </div>

        <div className='flex justify-end'>
          <Button variant='primary'>Guardar Configuración</Button>
        </div>
      </div>
    </div>
  );
};
