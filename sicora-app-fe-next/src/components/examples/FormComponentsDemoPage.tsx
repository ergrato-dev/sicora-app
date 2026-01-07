import React from 'react';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from '../ui/Radio';
import { RadioGroup } from '../ui/RadioGroup';
import { Button } from '../ui/Button';

export const FormComponentsDemoPage: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    description: '',
    newsletter: false,
    gender: '',
    experience: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const experienceOptions = [
    { value: 'beginner', label: 'Principiante', helperText: '0-1 años de experiencia' },
    { value: 'intermediate', label: 'Intermedio', helperText: '2-5 años de experiencia' },
    { value: 'advanced', label: 'Avanzado', helperText: '5+ años de experiencia' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación simple
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.experience) {
      newErrors.experience = 'Selecciona tu nivel de experiencia';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('Formulario enviado exitosamente!');
      console.log('Form data:', formData);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-8'>
      {/* Header */}
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-bold text-sena-primary'>
          Componentes de Formulario - Fase 1.4
        </h1>
        <p className='text-gray-600 text-lg'>
          Demo de componentes atómicos: Input, TextArea, Checkbox, Radio y RadioGroup
        </p>
      </div>

      {/* Demo Individual Components */}
      <div className='grid md:grid-cols-2 gap-8'>
        {/* Input Components */}
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-sena-primary border-b border-sena-light pb-2'>
            Input Components
          </h2>

          <div className='space-y-4'>
            <Input
              label='Input Básico'
              placeholder='Texto básico...'
              helperText='Este es un input básico sin iconos'
            />

            <Input
              label='Con Estado de Error'
              placeholder='Email inválido...'
              errorMessage='El formato del email no es válido'
              value='email-invalido'
            />

            <Input
              label='Con Estado de Éxito'
              placeholder='Email válido...'
              successMessage='Email verificado correctamente'
              value='usuario@ejemplo.com'
            />

            <Input
              label='Con Iconos'
              placeholder='Buscar...'
              leftIcon={
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              }
              rightIcon={
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              }
            />

            <div className='grid grid-cols-3 gap-2'>
              <Input placeholder='Pequeño' />
              <Input placeholder='Normal' />
              <Input placeholder='Grande' />
            </div>
          </div>
        </div>

        {/* TextArea Components */}
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-sena-primary border-b border-sena-light pb-2'>
            TextArea Components
          </h2>

          <div className='space-y-4'>
            <TextArea
              label='TextArea Básico'
              placeholder='Describe tu experiencia...'
              helperText='Mínimo 50 caracteres'
            />

            <TextArea
              label='Con Contador de Caracteres'
              placeholder='Máximo 200 caracteres...'
              maxLength={200}
              showCharacterCount
              value='Este es un ejemplo de texto que muestra el contador de caracteres.'
              onChange={(e) => console.log(e.target.value)}
            />

            <TextArea
              label='Con Error'
              placeholder='Texto requerido...'
              errorMessage='Este campo es obligatorio'
              maxLength={100}
            />

            <div className='grid grid-cols-3 gap-2'>
              <TextArea placeholder='Pequeño' />
              <TextArea placeholder='Normal' />
              <TextArea placeholder='Grande' />
            </div>
          </div>
        </div>
      </div>

      {/* Checkbox and Radio Components */}
      <div className='grid md:grid-cols-2 gap-8'>
        {/* Checkbox Components */}
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-sena-primary border-b border-sena-light pb-2'>
            Checkbox Components
          </h2>

          <div className='space-y-4'>
            <Checkbox label='Checkbox Básico' helperText='Marca esta opción si estás de acuerdo' />

            <Checkbox
              label='Con Estado de Error'
              errorMessage='Debes aceptar los términos y condiciones'
            />

            <Checkbox
              label='Con Estado de Éxito'
              successMessage='Configuración guardada correctamente'
              checked
            />

            <Checkbox label='Checkbox Deshabilitado' disabled />

            <Checkbox label='Indeterminado' indeterminate />

            <div className='flex gap-4'>
              <Checkbox label='Pequeño' />
              <Checkbox label='Normal' />
              <Checkbox label='Grande' />
            </div>
          </div>
        </div>

        {/* Radio Components */}
        <div className='space-y-6'>
          <h2 className='text-xl font-semibold text-sena-primary border-b border-sena-light pb-2'>
            Radio Components
          </h2>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Radio name='gender' value='male' label='Masculino' />
              <Radio name='gender' value='female' label='Femenino' />
              <Radio name='gender' value='other' label='Otro' />
            </div>

            <RadioGroup
              name='experience-level'
              label='Nivel de Experiencia'
              helperText='Selecciona tu nivel actual'
              options={experienceOptions}
              value={formData.experience}
              onChange={(value) => setFormData((prev) => ({ ...prev, experience: value }))}
              errorMessage={errors.experience}
              isRequired
            />

            <RadioGroup
              name='horizontal-example'
              label='Orientación Horizontal'
              options={[
                { value: 'yes', label: 'Sí' },
                { value: 'no', label: 'No' },
                { value: 'maybe', label: 'Tal vez' },
              ]}
              orientation='horizontal'
            />
          </div>
        </div>
      </div>

      {/* Complete Form Example */}
      <div className='bg-gray-50 rounded-lg p-6 space-y-6'>
        <h2 className='text-xl font-semibold text-sena-primary border-b border-sena-light pb-2'>
          Formulario Completo - Ejemplo de Uso
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid md:grid-cols-2 gap-4'>
            <Input
              label='Nombre Completo'
              placeholder='Ingresa tu nombre...'
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              errorMessage={errors.name}
              isRequired
            />

            <Input
              type='email'
              label='Correo Electrónico'
              placeholder='correo@ejemplo.com'
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              errorMessage={errors.email}
              isRequired
            />
          </div>

          <TextArea
            label='Descripción'
            placeholder='Cuéntanos sobre ti...'
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            errorMessage={errors.description}
            maxLength={500}
            showCharacterCount
            isRequired
          />

          <RadioGroup
            name='experience'
            label='Nivel de Experiencia'
            options={experienceOptions}
            value={formData.experience}
            onChange={(value) => setFormData((prev) => ({ ...prev, experience: value }))}
            errorMessage={errors.experience}
            isRequired
          />

          <Checkbox
            label='Suscribirse al newsletter'
            helperText='Recibe actualizaciones y novedades por email'
            checked={formData.newsletter}
            onChange={(e) => setFormData((prev) => ({ ...prev, newsletter: e.target.checked }))}
          />

          <div className='flex justify-end space-x-3 pt-4'>
            <Button variant='outline' type='button'>
              Limpiar
            </Button>
            <Button variant='primary' type='submit'>
              Enviar Formulario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
