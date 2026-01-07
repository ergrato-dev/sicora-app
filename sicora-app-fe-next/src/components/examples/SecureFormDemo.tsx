import { useState } from 'react';
import { ValidatedInput } from '../ValidatedInput';
import { Button } from '../Button';
import { useFormValidation } from '../../hooks/useValidation';
import {
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface UserFormData {
  cedula: string;
  nombre: string;
  email: string;
  telefono: string;
  fichaCode: string;
}

/**
 * SecureFormDemo - Ejemplo de formulario con validaciones REGEXP
 * Demuestra las prácticas de seguridad y UX/UI de SICORA
 */
export function SecureFormDemo() {
  const [formData, setFormData] = useState<UserFormData>({
    cedula: '',
    nombre: '',
    email: '',
    telefono: '',
    fichaCode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(null);

  // Validación del formulario completo
  const { formState, isFormValid, validateForm, resetForm } = useFormValidation({
    cedula: 'cedula',
    nombre: 'nombre',
    email: 'emailSena',
    telefono: 'telefono',
    fichaCode: 'fichaCode',
  });

  const handleInputChange =
    (field: keyof UserFormData) => (isValid: boolean, sanitizedValue?: string) => {
      if (isValid && sanitizedValue) {
        setFormData((prev) => ({
          ...prev,
          [field]: sanitizedValue,
        }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Validar todo el formulario antes del envío
      const formRecord: Record<string, string> = {
        name: formData.nombre,
        email: formData.email,
        phone: formData.telefono,
        document: formData.cedula,
      };
      const { isValid } = validateForm(formRecord);

      if (!isValid) {
        setSubmitResult('error');
        return;
      }

      // Simular envío al backend
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitResult('success');
      console.log('✅ Usuario creado con datos seguros:', formData);
    } catch (error) {
      setSubmitResult('error');
      console.error('❌ Error al crear usuario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      cedula: '',
      nombre: '',
      email: '',
      telefono: '',
      fichaCode: '',
    });
    resetForm();
    setSubmitResult(null);
  };

  return (
    <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          🔒 Formulario con Validación Segura
        </h2>
        <p className='text-gray-600'>
          Ejemplo de validación REGEXP para prevenir ataques y asegurar datos institucionales SENA
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Cédula */}
        <ValidatedInput
          label='Cédula de Ciudadanía'
          validationPattern='cedula'
          placeholder='12345678'
          helperText='Solo números, entre 7 y 10 dígitos'
          required
          onValidationChange={handleInputChange('cedula')}
        />

        {/* Nombre completo */}
        <ValidatedInput
          label='Nombre Completo'
          validationPattern='nombre'
          placeholder='María González Rodríguez'
          helperText='Solo letras, espacios y acentos latinos'
          required
          onValidationChange={handleInputChange('nombre')}
        />

        {/* Email institucional */}
        <ValidatedInput
          label='Email Institucional'
          validationPattern='emailSena'
          type='email'
          placeholder='usuario@sena.edu.co'
          helperText='Debe ser un email institucional @sena.edu.co'
          required
          onValidationChange={handleInputChange('email')}
        />

        {/* Teléfono */}
        <ValidatedInput
          label='Teléfono'
          validationPattern='telefono'
          type='tel'
          placeholder='+57 300 123 4567'
          helperText='Formato: +57 300 123 4567 o 300 123 4567'
          onValidationChange={handleInputChange('telefono')}
        />

        {/* Código de ficha */}
        <ValidatedInput
          label='Código de Ficha'
          validationPattern='fichaCode'
          placeholder='2830024'
          helperText='Exactamente 7 dígitos numéricos'
          onValidationChange={handleInputChange('fichaCode')}
        />

        {/* Estado del formulario */}
        {Object.keys(formState).length > 0 && (
          <div className='p-4 bg-gray-50 rounded-lg'>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>Estado de Validación:</h4>
            <div className='space-y-1 text-sm'>
              {Object.entries(formState).map(([field, validation]) => (
                <div key={field} className='flex items-center space-x-2'>
                  {validation.isValid ? (
                    <CheckCircleIcon className='h-4 w-4 text-green-500' />
                  ) : (
                    <ExclamationTriangleIcon className='h-4 w-4 text-red-500' />
                  )}
                  <span className={validation.isValid ? 'text-green-700' : 'text-red-700'}>
                    {field}: {validation.isValid ? 'Válido' : validation.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resultado del envío */}
        {submitResult === 'success' && (
          <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex items-center space-x-2 text-green-700'>
              <CheckCircleIcon className='h-5 w-5' />
              <span className='font-medium'>¡Usuario creado exitosamente!</span>
            </div>
            <p className='text-sm text-green-600 mt-1'>
              Todos los datos han sido validados y son seguros.
            </p>
          </div>
        )}

        {submitResult === 'error' && (
          <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center space-x-2 text-red-700'>
              <ExclamationTriangleIcon className='h-5 w-5' />
              <span className='font-medium'>Error en la validación</span>
            </div>
            <p className='text-sm text-red-600 mt-1'>
              Por favor, revisa los campos marcados en rojo.
            </p>
          </div>
        )}

        {/* ✅ Botones siguiendo las guías UX/UI - SIEMPRE A LA DERECHA */}
        <div className='flex justify-between items-center pt-6 border-t border-gray-200'>
          {/* Acción destructiva separada a la izquierda */}
          <Button
            type='button'
            variant='outline'
            onClick={handleReset}
            className='text-red-600 border-red-300 hover:bg-red-50'
            disabled={isSubmitting}
          >
            <TrashIcon className='w-4 h-4 mr-2' />
            Limpiar Formulario
          </Button>

          {/* Flujo principal de acciones a la derecha */}
          <div className='flex space-x-3'>
            <Button type='button' variant='secondary' disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={!isFormValid || isSubmitting}
              className='relative'
            >
              {isSubmitting ? (
                <>
                  <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2' />
                  Validando...
                </>
              ) : (
                <>
                  <UserPlusIcon className='w-4 h-4 mr-2' />
                  Crear Usuario
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Información de seguridad */}
      <div className='mt-8 p-4 bg-sena-primary-50 border border-sena-primary-200 rounded-lg'>
        <h4 className='text-sm font-semibold text-sena-primary-800 mb-2'>
          🛡️ Características de Seguridad Implementadas:
        </h4>
        <ul className='text-sm text-sena-primary-700 space-y-1'>
          <li>
            • <strong>Validación REGEXP</strong>: Patrones específicos para cada campo
          </li>
          <li>
            • <strong>Sanitización automática</strong>: Eliminación de contenido peligroso
          </li>
          <li>
            • <strong>Prevención XSS</strong>: Filtrado de scripts y código malicioso
          </li>
          <li>
            • <strong>Validación institucional</strong>: Email @sena.edu.co obligatorio
          </li>
          <li>
            • <strong>Feedback visual</strong>: Estados claros de validación
          </li>
          <li>
            • <strong>UX/UI SENA</strong>: Botones de acción siempre a la derecha
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SecureFormDemo;
