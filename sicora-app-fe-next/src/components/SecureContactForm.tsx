import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from './Button';
import { cn } from '../utils/cn';

/**
 * SecureContactForm - Formulario de contacto seguro para SICORA
 * Alternativa moderna y segura a mailto: links
 */

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'consulta' | 'soporte' | 'error' | 'sugerencia';
}

interface SecureContactFormProps {
  /** Clase CSS adicional */
  className?: string;
  /** Callback cuando se envía el formulario */
  onSubmit?: (data: ContactFormData) => void;
  /** Mostrar en modo compacto */
  compact?: boolean;
}

export function SecureContactForm({
  className,
  onSubmit,
  compact = false,
}: SecureContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'consulta',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular envío (en producción iría al backend)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSubmit) {
        onSubmit(formData);
      }

      setSubmitted(true);

      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          type: 'consulta',
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error enviando formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div
        className={cn(
          'bg-sena-primary-50 border border-sena-primary-200 rounded-lg p-6',
          className
        )}
      >
        <div className='text-center space-y-3'>
          <div className='text-2xl'>✅</div>
          <h3 className='text-lg font-sena-heading font-semibold text-sena-primary-700'>
            ¡Mensaje Enviado!
          </h3>
          <p className='text-sm text-sena-neutral-600'>
            Gracias por tu mensaje. En un entorno real, recibirías una respuesta pronto.
          </p>
          <p className='text-xs text-sena-neutral-500 italic'>
            ⚠️ Este es un formulario de demostración. No se envían correos reales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'bg-white border border-sena-neutral-200 rounded-lg shadow-sm',
        compact ? 'p-4 space-y-3' : 'p-6 space-y-4',
        className
      )}
    >
      <div className='space-y-2'>
        <h3 className='text-lg font-sena-heading font-semibold text-sena-neutral-800'>
          📧 Formulario de Contacto Seguro
        </h3>
        <p className='text-sm text-sena-neutral-600'>
          Alternativa segura y moderna a los enlaces mailto tradicionales
        </p>
      </div>

      <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-sena-neutral-700'>Nombre completo</label>
          <input
            type='text'
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className='w-full px-3 py-2 border border-sena-neutral-300 rounded-md focus:ring-sena-primary-500 focus:border-sena-primary-500'
            placeholder='Tu nombre completo'
            required
          />
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium text-sena-neutral-700'>
            Correo electrónico
          </label>
          <input
            type='email'
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className='w-full px-3 py-2 border border-sena-neutral-300 rounded-md focus:ring-sena-primary-500 focus:border-sena-primary-500'
            placeholder='correo@ejemplo.com'
            required
          />
        </div>
      </div>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-sena-neutral-700'>Tipo de consulta</label>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value as ContactFormData['type'])}
          className='w-full px-3 py-2 border border-sena-neutral-300 rounded-md focus:ring-sena-primary-500 focus:border-sena-primary-500'
        >
          <option value='consulta'>💬 Consulta general</option>
          <option value='soporte'>🔧 Soporte técnico</option>
          <option value='error'>🚨 Reportar error</option>
          <option value='sugerencia'>💡 Sugerencia</option>
        </select>
      </div>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-sena-neutral-700'>Asunto</label>
        <input
          type='text'
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className='w-full px-3 py-2 border border-sena-neutral-300 rounded-md focus:ring-sena-primary-500 focus:border-sena-primary-500'
          placeholder='Breve descripción del tema'
          required
        />
      </div>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-sena-neutral-700'>Mensaje</label>
        <textarea
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          rows={compact ? 3 : 4}
          className='w-full px-3 py-2 border border-sena-neutral-300 rounded-md focus:ring-sena-primary-500 focus:border-sena-primary-500 resize-none'
          placeholder='Describe tu consulta o problema...'
          required
        />
      </div>

      <div className='space-y-3'>
        <Button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-sena-primary-600 hover:bg-sena-primary-700 text-white'
        >
          {isSubmitting ? '⏳ Enviando...' : '📤 Enviar Mensaje'}
        </Button>

        <div className='bg-sena-secondary-50 border border-sena-secondary-200 rounded-md p-3'>
          <p className='text-xs text-sena-neutral-600'>
            <strong>🔒 Privacidad y Seguridad:</strong>
          </p>
          <ul className='text-xs text-sena-neutral-500 mt-1 space-y-1'>
            <li>• Este formulario NO expone correos reales en el código fuente</li>
            <li>• Los datos se procesan de forma segura en el servidor</li>
            <li>• Se incluye protección anti-spam automática</li>
            <li>• Es un entorno de demostración - no se envían correos reales</li>
          </ul>
        </div>
      </div>
    </form>
  );
}

export default SecureContactForm;
