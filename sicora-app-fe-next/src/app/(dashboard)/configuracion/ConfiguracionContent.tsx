'use client';

/**
 * ConfiguracionContent - Componente principal del módulo de Configuración
 *
 * Características:
 * - Perfil de usuario con datos personales
 * - Preferencias de notificaciones
 * - Configuración del sistema (admin)
 * - Seguridad y acceso
 * - Apariencia y personalización
 *
 * @component
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Palette,
  Settings,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building2,
  Key,
  Eye,
  EyeOff,
  Globe,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ============================================================================
// TIPOS
// ============================================================================

type SectionId = 'perfil' | 'notificaciones' | 'seguridad' | 'apariencia' | 'sistema';

interface Section {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

type Theme = 'light' | 'dark' | 'system';

// ============================================================================
// DATOS DEMO
// ============================================================================

const DEMO_USER = {
  id: 'user-1',
  name: 'Carlos Eduardo Rodríguez',
  email: 'carlos.rodriguez@onevision.edu.co',
  phone: '+57 300 123 4567',
  document: '1234567890',
  role: 'Instructor',
  department: 'Sede Formación',
  area: 'Tecnologías de la Información',
  avatar: null,
  joinedAt: '2023-01-15',
};

const SECTIONS: Section[] = [
  { id: 'perfil', label: 'Perfil', icon: User, description: 'Información personal y de contacto' },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell, description: 'Preferencias de alertas y avisos' },
  { id: 'seguridad', label: 'Seguridad', icon: Shield, description: 'Contraseña y acceso' },
  { id: 'apariencia', label: 'Apariencia', icon: Palette, description: 'Tema y personalización' },
  { id: 'sistema', label: 'Sistema', icon: Settings, description: 'Configuración avanzada' },
];

// ============================================================================
// COMPONENTES DE SECCIÓN
// ============================================================================

/**
 * Sección de Perfil
 */
function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    phone: DEMO_USER.phone,
  });

  const handleSave = () => {
    console.log('Guardando perfil:', formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Avatar y datos principales */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-sena-primary-100 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-sena-primary-600" />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Camera className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{DEMO_USER.name}</h3>
          <p className="text-gray-500">{DEMO_USER.role}</p>
          <div className="flex items-center gap-2 mt-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{DEMO_USER.department} - {DEMO_USER.area}</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Miembro desde {new Date(DEMO_USER.joinedAt).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Información de contacto</h4>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-sena-primary-600 hover:text-sena-primary-700"
            >
              Editar
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-sm text-sena-primary-600 hover:text-sena-primary-700"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className={cn(
                  'w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg',
                  isEditing ? 'focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent' : 'bg-white'
                )}
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className={cn(
                  'w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg',
                  isEditing ? 'focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent' : 'bg-white'
                )}
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className={cn(
                  'w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg',
                  isEditing ? 'focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent' : 'bg-white'
                )}
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-document" className="block text-sm font-medium text-gray-700 mb-1">
              Documento
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-document"
                type="text"
                value={DEMO_USER.document}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sección de Notificaciones
 */
function NotificationsSection() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    attendanceAlerts: true,
    evaluationReminders: true,
    scheduleChanges: true,
    systemUpdates: false,
    weeklyReports: true,
    instantAlerts: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const NotificationToggle = ({ 
    id, 
    label, 
    description, 
    enabled 
  }: Readonly<{ id: keyof typeof settings; label: string; description: string; enabled: boolean }>) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => toggleSetting(id)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors',
          enabled ? 'bg-sena-primary-500' : 'bg-gray-200'
        )}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
      >
        <span
          className={cn(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
            enabled ? 'left-7' : 'left-1'
          )}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Canales de notificación */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Canales de notificación</h4>
        <NotificationToggle
          id="emailNotifications"
          label="Correo electrónico"
          description="Recibir notificaciones por email"
          enabled={settings.emailNotifications}
        />
        <NotificationToggle
          id="pushNotifications"
          label="Notificaciones push"
          description="Notificaciones en el navegador"
          enabled={settings.pushNotifications}
        />
      </div>

      {/* Tipos de alerta */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Tipos de alerta</h4>
        <NotificationToggle
          id="attendanceAlerts"
          label="Alertas de asistencia"
          description="Estudiantes con inasistencias frecuentes"
          enabled={settings.attendanceAlerts}
        />
        <NotificationToggle
          id="evaluationReminders"
          label="Recordatorios de evaluación"
          description="Evaluaciones próximas a vencer"
          enabled={settings.evaluationReminders}
        />
        <NotificationToggle
          id="scheduleChanges"
          label="Cambios de horario"
          description="Modificaciones en la programación"
          enabled={settings.scheduleChanges}
        />
        <NotificationToggle
          id="systemUpdates"
          label="Actualizaciones del sistema"
          description="Nuevas funcionalidades y mejoras"
          enabled={settings.systemUpdates}
        />
      </div>

      {/* Frecuencia */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Frecuencia</h4>
        <NotificationToggle
          id="instantAlerts"
          label="Alertas instantáneas"
          description="Recibir notificaciones en tiempo real"
          enabled={settings.instantAlerts}
        />
        <NotificationToggle
          id="weeklyReports"
          label="Resumen semanal"
          description="Reporte consolidado cada lunes"
          enabled={settings.weeklyReports}
        />
      </div>
    </div>
  );
}

/**
 * Sección de Seguridad
 */
function SecuritySection() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Cambiando contraseña...');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-6">
      {/* Cambiar contraseña */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Cambiar contraseña</h4>
        
        <div className="space-y-4 max-w-md">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña actual
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="current-password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            className="flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white rounded-lg hover:bg-sena-primary-600 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Actualizar contraseña
          </button>
        </div>
      </div>

      {/* Sesiones activas */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Sesiones activas</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Monitor className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Este dispositivo</p>
                <p className="text-sm text-gray-500">Chrome · Linux · Bogotá, Colombia</p>
              </div>
            </div>
            <span className="text-sm text-green-600 font-medium">Activa ahora</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Phone className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">iPhone 14</p>
                <p className="text-sm text-gray-500">Safari · iOS · Última vez: hace 2 horas</p>
              </div>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700">
              Cerrar sesión
            </button>
          </div>
        </div>

        <button className="mt-4 text-sm text-red-600 hover:text-red-700">
          Cerrar todas las demás sesiones
        </button>
      </div>
    </div>
  );
}

/**
 * Sección de Apariencia
 */
function AppearanceSection() {
  const [theme, setTheme] = useState<Theme>('system');
  const [language, setLanguage] = useState('es');
  const [compactMode, setCompactMode] = useState(false);

  const ThemeOption = ({ 
    value, 
    icon: Icon, 
    label 
  }: Readonly<{ value: Theme; icon: React.ComponentType<{ className?: string }>; label: string }>) => (
    <button
      onClick={() => setTheme(value)}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors',
        theme === value
          ? 'border-sena-primary-500 bg-sena-primary-50'
          : 'border-gray-200 hover:bg-gray-50'
      )}
    >
      <Icon className={cn('w-6 h-6', theme === value ? 'text-sena-primary-600' : 'text-gray-400')} />
      <span className={cn('text-sm font-medium', theme === value ? 'text-sena-primary-600' : 'text-gray-600')}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Tema */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Tema de la interfaz</h4>
        <div className="grid grid-cols-3 gap-4">
          <ThemeOption value="light" icon={Sun} label="Claro" />
          <ThemeOption value="dark" icon={Moon} label="Oscuro" />
          <ThemeOption value="system" icon={Monitor} label="Sistema" />
        </div>
        <p className="text-sm text-gray-500 mt-4">
          <Info className="w-4 h-4 inline mr-1" />
          El tema oscuro estará disponible próximamente
        </p>
      </div>

      {/* Idioma */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Idioma</h4>
        <div className="relative max-w-xs">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="es">Español (Colombia)</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Modo compacto */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Modo compacto</h4>
            <p className="text-sm text-gray-500">Reduce el espaciado para mostrar más contenido</p>
          </div>
          <button
            onClick={() => setCompactMode(!compactMode)}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              compactMode ? 'bg-sena-primary-500' : 'bg-gray-200'
            )}
            role="switch"
            aria-checked={compactMode}
            aria-label="Modo compacto"
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                compactMode ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Sección de Sistema (solo admin)
 */
function SystemSection() {
  return (
    <div className="space-y-6">
      {/* Info del sistema */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Información del sistema</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Versión</span>
            <span className="font-mono text-gray-900">2.0.0-beta</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Última actualización</span>
            <span className="text-gray-900">15 de enero, 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Entorno</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-sm">Desarrollo</span>
          </div>
        </div>
      </div>

      {/* Estado de servicios */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Estado de servicios</h4>
        <div className="space-y-3">
          <ServiceStatus name="API Backend (Go)" status="online" />
          <ServiceStatus name="API Backend (Python)" status="online" />
          <ServiceStatus name="Base de datos" status="online" />
          <ServiceStatus name="Servidor de archivos" status="warning" />
          <ServiceStatus name="Servicio de notificaciones" status="offline" />
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Zona de precaución</h4>
            <p className="text-sm text-amber-700 mt-1">
              Las acciones en esta sección pueden afectar el funcionamiento del sistema.
            </p>
            <div className="flex gap-3 mt-4">
              <button className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm">
                Limpiar caché
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm">
                Reiniciar servicios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Estado de servicio
 */
function ServiceStatus({ name, status }: Readonly<{ name: string; status: 'online' | 'offline' | 'warning' }>) {
  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Activo' },
    offline: { color: 'bg-red-500', label: 'Inactivo' },
    warning: { color: 'bg-amber-500', label: 'Degradado' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-700">{name}</span>
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full', config.color)} />
        <span className="text-sm text-gray-500">{config.label}</span>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ConfiguracionContent() {
  const [activeSection, setActiveSection] = useState<SectionId>('perfil');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'perfil':
        return <ProfileSection />;
      case 'notificaciones':
        return <NotificationsSection />;
      case 'seguridad':
        return <SecuritySection />;
      case 'apariencia':
        return <AppearanceSection />;
      case 'sistema':
        return <SystemSection />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-1 text-gray-500">
            Administra tu cuenta y preferencias del sistema
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white rounded-lg hover:bg-sena-primary-600 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar cambios
            </>
          )}
        </button>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de navegación */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2',
                    isActive
                      ? 'bg-sena-primary-50 border-sena-primary-500 text-sena-primary-700'
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? 'text-sena-primary-600' : 'text-gray-400')} />
                  <div>
                    <p className="font-medium">{section.label}</p>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
