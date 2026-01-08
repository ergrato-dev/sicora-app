/**
 * Página de Administración de Branding
 * Permite configurar nombre, logo y colores del sistema
 */

import { useState, useEffect } from 'react';
import {
  Settings,
  Palette,
  Image,
  Type,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Upload,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useBrandingStore, useCurrentBranding } from '../../stores/branding.store';
import { COLOR_PRESETS } from '../../types/branding.types';
import type { ThemeColors } from '../../types/branding.types';

export function BrandingAdminPage() {
  const {
    isLoading,
    error,
    isDirty,
    previewMode,
    fetchBranding,
    updateBranding,
    resetToDefaults,
    setPreviewMode,
    applyPreview,
    cancelPreview,
    clearError,
  } = useBrandingStore();

  const config = useCurrentBranding();

  // Estado local para el formulario
  const [activeTab, setActiveTab] = useState<'identity' | 'logo' | 'colors' | 'texts'>('identity');
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    organization: '',
    organizationFull: '',
    contactEmail: '',
  });
  const [logoUrls, setLogoUrls] = useState({
    primary: '',
    dark: '',
    small: '',
    favicon: '',
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customColors, setCustomColors] = useState<ThemeColors | null>(null);

  // Cargar configuración al montar
  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  // Sincronizar form con config
  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        subtitle: config.subtitle,
        description: config.description,
        organization: config.organization,
        organizationFull: config.organizationFull,
        contactEmail: config.contactEmail,
      });
      setLogoUrls({
        primary: config.logo.primary,
        dark: config.logo.dark || '',
        small: config.logo.small || '',
        favicon: config.logo.favicon || '',
      });
      setCustomColors(config.theme.light);
    }
  }, [config]);

  // Handlers
  const handleIdentityChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (type: keyof typeof logoUrls, value: string) => {
    setLogoUrls((prev) => ({ ...prev, [type]: value }));
  };

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setCustomColors((prev) => (prev ? { ...prev, [colorKey]: value } : null));
    setSelectedPreset(null);
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = COLOR_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setCustomColors(preset.colors);
    }
  };

  const handleSave = async () => {
    if (previewMode) {
      await applyPreview();
    } else {
      await updateBranding({
        ...formData,
        logo: {
          ...config.logo,
          primary: logoUrls.primary,
          dark: logoUrls.dark || undefined,
          small: logoUrls.small || undefined,
          favicon: logoUrls.favicon || undefined,
        },
        theme: customColors
          ? {
              ...config.theme,
              light: customColors,
            }
          : undefined,
      });
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        '¿Está seguro de restaurar los valores por defecto? Esta acción no se puede deshacer.'
      )
    ) {
      await resetToDefaults();
    }
  };

  const tabs = [
    { id: 'identity', label: 'Identidad', icon: Type },
    { id: 'logo', label: 'Logo', icon: Image },
    { id: 'colors', label: 'Colores', icon: Palette },
    { id: 'texts', label: 'Textos', icon: Settings },
  ] as const;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Configuración de Marca</h1>
          <p className='text-muted-foreground mt-1'>
            Personaliza el nombre, logo y colores del sistema
          </p>
        </div>

        <div className='flex items-center gap-3'>
          {/* Preview toggle */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
              previewMode
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {previewMode ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            {previewMode ? 'Salir Preview' : 'Vista Previa'}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className='px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-input rounded-lg hover:bg-muted flex items-center gap-2'
          >
            <RotateCcw className='h-4 w-4' />
            Restaurar
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50'
          >
            <Save className='h-4 w-4' />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Preview banner */}
      {previewMode && (
        <div className='flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg'>
          <div className='flex items-center gap-3'>
            <Eye className='h-5 w-5 text-primary' />
            <span className='text-sm font-medium text-primary'>
              Modo Vista Previa - Los cambios no se han guardado
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={cancelPreview}
              className='px-3 py-1 text-sm text-muted-foreground hover:text-foreground'
            >
              Cancelar
            </button>
            <button
              onClick={applyPreview}
              className='px-3 py-1 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90'
            >
              Aplicar Cambios
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className='flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
          <AlertCircle className='h-5 w-5 text-destructive' />
          <p className='text-sm text-destructive'>{error}</p>
          <button onClick={clearError} className='ml-auto text-sm text-destructive hover:underline'>
            Cerrar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className='border-b border-border'>
        <nav className='flex gap-4'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className='h-4 w-4' />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className='bg-card rounded-lg border border-border p-6'>
        {/* Identity Tab */}
        {activeTab === 'identity' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Nombre del Sistema
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) => handleIdentityChange('name', e.target.value)}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='SICORA'
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Nombre que aparece en el header y título del navegador
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>Subtítulo</label>
                <input
                  type='text'
                  value={formData.subtitle}
                  onChange={(e) => handleIdentityChange('subtitle', e.target.value)}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='Sistema de Coordinación Académica'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleIdentityChange('description', e.target.value)}
                  rows={3}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none'
                  placeholder='Plataforma integral para la gestión académica'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Organización
                </label>
                <input
                  type='text'
                  value={formData.organization}
                  onChange={(e) => handleIdentityChange('organization', e.target.value)}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='OneVision'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Email de Contacto
                </label>
                <input
                  type='email'
                  value={formData.contactEmail}
                  onChange={(e) => handleIdentityChange('contactEmail', e.target.value)}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='contacto@onevision.com'
                />
              </div>
            </div>
          </div>
        )}

        {/* Logo Tab */}
        {activeTab === 'logo' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Logo Principal */}
              <div className='space-y-4'>
                <label className='block text-sm font-medium text-foreground'>Logo Principal</label>
                <div className='flex items-center gap-4'>
                  <div className='w-24 h-24 border border-dashed border-input rounded-lg flex items-center justify-center bg-muted/30'>
                    {logoUrls.primary ? (
                      <img
                        src={logoUrls.primary}
                        alt='Logo principal'
                        className='max-w-full max-h-full object-contain'
                      />
                    ) : (
                      <Image className='h-8 w-8 text-muted-foreground' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <input
                      type='text'
                      value={logoUrls.primary}
                      onChange={(e) => handleLogoChange('primary', e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-input rounded-lg bg-background'
                      placeholder='URL del logo o base64'
                    />
                    <button className='mt-2 px-3 py-1 text-sm text-primary hover:underline flex items-center gap-1'>
                      <Upload className='h-3 w-3' />
                      Subir archivo
                    </button>
                  </div>
                </div>
              </div>

              {/* Logo Oscuro */}
              <div className='space-y-4'>
                <label className='block text-sm font-medium text-foreground'>
                  Logo Tema Oscuro (opcional)
                </label>
                <div className='flex items-center gap-4'>
                  <div className='w-24 h-24 border border-dashed border-input rounded-lg flex items-center justify-center bg-gray-800'>
                    {logoUrls.dark ? (
                      <img
                        src={logoUrls.dark}
                        alt='Logo oscuro'
                        className='max-w-full max-h-full object-contain'
                      />
                    ) : (
                      <Image className='h-8 w-8 text-gray-500' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <input
                      type='text'
                      value={logoUrls.dark}
                      onChange={(e) => handleLogoChange('dark', e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-input rounded-lg bg-background'
                      placeholder='URL del logo para tema oscuro'
                    />
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div className='space-y-4'>
                <label className='block text-sm font-medium text-foreground'>Favicon</label>
                <div className='flex items-center gap-4'>
                  <div className='w-16 h-16 border border-dashed border-input rounded-lg flex items-center justify-center bg-muted/30'>
                    {logoUrls.favicon ? (
                      <img
                        src={logoUrls.favicon}
                        alt='Favicon'
                        className='w-8 h-8 object-contain'
                      />
                    ) : (
                      <Image className='h-6 w-6 text-muted-foreground' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <input
                      type='text'
                      value={logoUrls.favicon}
                      onChange={(e) => handleLogoChange('favicon', e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-input rounded-lg bg-background'
                      placeholder='URL del favicon (.ico, .png)'
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      Recomendado: 32x32 o 48x48 píxeles
                    </p>
                  </div>
                </div>
              </div>

              {/* Logo pequeño */}
              <div className='space-y-4'>
                <label className='block text-sm font-medium text-foreground'>
                  Logo Pequeño (navbar)
                </label>
                <div className='flex items-center gap-4'>
                  <div className='w-16 h-16 border border-dashed border-input rounded-lg flex items-center justify-center bg-muted/30'>
                    {logoUrls.small ? (
                      <img
                        src={logoUrls.small}
                        alt='Logo pequeño'
                        className='max-w-full max-h-full object-contain'
                      />
                    ) : (
                      <Image className='h-6 w-6 text-muted-foreground' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <input
                      type='text'
                      value={logoUrls.small}
                      onChange={(e) => handleLogoChange('small', e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-input rounded-lg bg-background'
                      placeholder='URL del logo pequeño'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className='space-y-6'>
            {/* Presets */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-3'>
                Paletas Predefinidas
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3'>
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedPreset === preset.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-input hover:border-primary/50'
                    }`}
                  >
                    <div className='flex gap-1 mb-2'>
                      <div
                        className='w-6 h-6 rounded-full'
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <div
                        className='w-6 h-6 rounded-full'
                        style={{ backgroundColor: preset.colors.accent }}
                      />
                      <div
                        className='w-6 h-6 rounded-full'
                        style={{ backgroundColor: preset.colors.success }}
                      />
                    </div>
                    <p className='text-xs font-medium text-foreground text-left'>{preset.name}</p>
                    {selectedPreset === preset.id && (
                      <Check className='h-4 w-4 text-primary absolute top-2 right-2' />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-3'>
                Colores Personalizados
              </label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {customColors &&
                  Object.entries(customColors)
                    .filter(([key]) => !key.includes('Foreground'))
                    .map(([key, value]) => (
                      <div key={key}>
                        <label className='block text-xs text-muted-foreground mb-1 capitalize'>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className='flex items-center gap-2'>
                          <input
                            type='color'
                            value={value}
                            onChange={(e) =>
                              handleColorChange(key as keyof ThemeColors, e.target.value)
                            }
                            className='w-10 h-10 rounded border border-input cursor-pointer'
                          />
                          <input
                            type='text'
                            value={value}
                            onChange={(e) =>
                              handleColorChange(key as keyof ThemeColors, e.target.value)
                            }
                            className='flex-1 px-2 py-1 text-xs border border-input rounded bg-background uppercase'
                          />
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-3'>Vista Previa</label>
              <div className='p-6 bg-muted/30 rounded-lg space-y-4'>
                <div className='flex flex-wrap gap-3'>
                  <button
                    className='px-4 py-2 text-sm font-medium text-white rounded-lg'
                    style={{ backgroundColor: customColors?.primary }}
                  >
                    Botón Primario
                  </button>
                  <button
                    className='px-4 py-2 text-sm font-medium text-white rounded-lg'
                    style={{ backgroundColor: customColors?.secondary }}
                  >
                    Botón Secundario
                  </button>
                  <button
                    className='px-4 py-2 text-sm font-medium text-white rounded-lg'
                    style={{ backgroundColor: customColors?.destructive }}
                  >
                    Eliminar
                  </button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <span
                    className='px-3 py-1 text-xs font-medium text-white rounded-full'
                    style={{ backgroundColor: customColors?.success }}
                  >
                    Éxito
                  </span>
                  <span
                    className='px-3 py-1 text-xs font-medium text-white rounded-full'
                    style={{ backgroundColor: customColors?.warning }}
                  >
                    Advertencia
                  </span>
                  <span
                    className='px-3 py-1 text-xs font-medium text-white rounded-full'
                    style={{ backgroundColor: customColors?.info }}
                  >
                    Información
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Texts Tab */}
        {activeTab === 'texts' && (
          <div className='space-y-6'>
            <p className='text-sm text-muted-foreground'>
              Personaliza los textos que aparecen en diferentes partes del sistema.
            </p>

            <div className='grid grid-cols-1 gap-6'>
              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Mensaje de Bienvenida
                </label>
                <input
                  type='text'
                  defaultValue={config.texts.welcomeMessage}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Subtítulo de Login
                </label>
                <input
                  type='text'
                  defaultValue={config.texts.loginSubtitle}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Título del Dashboard
                </label>
                <input
                  type='text'
                  defaultValue={config.texts.dashboardTitle}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>
                  Texto del Footer
                </label>
                <textarea
                  defaultValue={config.texts.footerText}
                  rows={2}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-2'>Copyright</label>
                <input
                  type='text'
                  defaultValue={config.texts.copyright}
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Usa {'{year}'} para insertar el año actual automáticamente
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dirty indicator */}
      {isDirty && (
        <div className='fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg shadow-lg'>
          <span className='text-sm text-muted-foreground'>Hay cambios sin guardar</span>
          <button
            onClick={handleSave}
            className='px-3 py-1 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90'
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}

export default BrandingAdminPage;
