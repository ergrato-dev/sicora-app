/**
 * Tipos para configuración de branding y tema del sistema
 * Configurable por administradores
 */

// ============================================================================
// THEME COLORS
// ============================================================================

export interface ThemeColors {
  /** Color primario (botones, enlaces, acentos) */
  primary: string;
  /** Color primario foreground (texto sobre primario) */
  primaryForeground: string;
  /** Color secundario */
  secondary: string;
  /** Color secundario foreground */
  secondaryForeground: string;
  /** Color destructivo (errores, eliminar) */
  destructive: string;
  /** Color destructivo foreground */
  destructiveForeground: string;
  /** Color de acento */
  accent: string;
  /** Color de acento foreground */
  accentForeground: string;
  /** Color de éxito */
  success: string;
  /** Color de advertencia */
  warning: string;
  /** Color de información */
  info: string;
}

export interface ThemeConfig {
  /** Nombre del tema */
  name: string;
  /** Colores del tema claro */
  light: ThemeColors;
  /** Colores del tema oscuro */
  dark: ThemeColors;
}

// ============================================================================
// LOGO CONFIG
// ============================================================================

export interface LogoConfig {
  /** URL del logo principal (puede ser base64 o URL) */
  primary: string;
  /** URL del logo para tema oscuro (opcional, usa primary si no se especifica) */
  dark?: string;
  /** URL del favicon */
  favicon?: string;
  /** URL del logo pequeño (navbar) */
  small?: string;
  /** Texto alternativo */
  alt: string;
  /** Mostrar logo en header */
  showInHeader: boolean;
  /** Mostrar logo en login */
  showInLogin: boolean;
  /** Mostrar logo en footer */
  showInFooter: boolean;
}

// ============================================================================
// BRANDING CONFIG
// ============================================================================

export interface BrandingConfig {
  /** ID único de la configuración */
  id: string;
  /** Nombre del sistema */
  name: string;
  /** Subtítulo del sistema */
  subtitle: string;
  /** Descripción corta */
  description: string;
  /** Nombre de la organización */
  organization: string;
  /** Nombre completo de la organización */
  organizationFull: string;
  /** Email de contacto */
  contactEmail: string;
  /** URL de soporte */
  supportUrl: string;
  /** URL de documentación */
  docsUrl: string;
  /** URL del sitio web */
  websiteUrl: string;
  /** Configuración de logos */
  logo: LogoConfig;
  /** Configuración del tema */
  theme: ThemeConfig;
  /** Textos personalizados */
  texts: BrandingTexts;
  /** Metadatos SEO */
  seo: SEOConfig;
  /** Fecha de última actualización */
  updatedAt: string;
  /** Usuario que actualizó */
  updatedBy?: string;
}

// ============================================================================
// CUSTOM TEXTS
// ============================================================================

export interface BrandingTexts {
  /** Mensaje de bienvenida */
  welcomeMessage: string;
  /** Texto del footer */
  footerText: string;
  /** Subtítulo de login */
  loginSubtitle: string;
  /** Título del dashboard */
  dashboardTitle: string;
  /** Descripción del sistema */
  systemDescription: string;
  /** Mensaje de copyright */
  copyright: string;
}

// ============================================================================
// SEO CONFIG
// ============================================================================

export interface SEOConfig {
  /** Título de la página */
  title: string;
  /** Meta descripción */
  description: string;
  /** Palabras clave */
  keywords: string[];
  /** URL canónica base */
  canonicalUrl: string;
  /** Open Graph image */
  ogImage?: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface UpdateBrandingRequest {
  name?: string;
  subtitle?: string;
  description?: string;
  organization?: string;
  organizationFull?: string;
  contactEmail?: string;
  supportUrl?: string;
  docsUrl?: string;
  websiteUrl?: string;
  logo?: Partial<LogoConfig>;
  theme?: Partial<ThemeConfig>;
  texts?: Partial<BrandingTexts>;
  seo?: Partial<SEOConfig>;
}

export interface UploadLogoRequest {
  type: 'primary' | 'dark' | 'favicon' | 'small';
  file: File;
}

export interface UploadLogoResponse {
  url: string;
  type: string;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: '#3b82f6', // blue-500
  primaryForeground: '#ffffff',
  secondary: '#6b7280', // gray-500
  secondaryForeground: '#ffffff',
  destructive: '#ef4444', // red-500
  destructiveForeground: '#ffffff',
  accent: '#8b5cf6', // violet-500
  accentForeground: '#ffffff',
  success: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
  info: '#06b6d4', // cyan-500
};

export const DEFAULT_DARK_THEME_COLORS: ThemeColors = {
  primary: '#60a5fa', // blue-400
  primaryForeground: '#1e293b',
  secondary: '#9ca3af', // gray-400
  secondaryForeground: '#1e293b',
  destructive: '#f87171', // red-400
  destructiveForeground: '#1e293b',
  accent: '#a78bfa', // violet-400
  accentForeground: '#1e293b',
  success: '#4ade80', // green-400
  warning: '#fbbf24', // amber-400
  info: '#22d3ee', // cyan-400
};

export const DEFAULT_BRANDING: BrandingConfig = {
  id: 'default',
  name: 'SICORA',
  subtitle: 'Sistema de Coordinación Académica',
  description: 'Plataforma integral para la gestión académica',
  organization: 'OneVision',
  organizationFull: 'OneVision - Soluciones Tecnológicas Educativas',
  contactEmail: 'contacto@onevision.com',
  supportUrl: '/soporte',
  docsUrl: '/docs',
  websiteUrl: 'https://onevision.com',
  logo: {
    primary: '/assets/logos/logo-primary.svg',
    dark: '/assets/logos/logo-dark.svg',
    favicon: '/favicon.ico',
    small: '/assets/logos/logo-small.svg',
    alt: 'SICORA Logo',
    showInHeader: true,
    showInLogin: true,
    showInFooter: true,
  },
  theme: {
    name: 'Default',
    light: DEFAULT_THEME_COLORS,
    dark: DEFAULT_DARK_THEME_COLORS,
  },
  texts: {
    welcomeMessage: '¡Bienvenido al Sistema SICORA!',
    footerText: `© ${new Date().getFullYear()} OneVision. Todos los derechos reservados.`,
    loginSubtitle: 'Accede al Sistema de Coordinación Académica',
    dashboardTitle: 'Panel de Control',
    systemDescription: 'Sistema integral de gestión académica',
    copyright: `© ${new Date().getFullYear()} OneVision`,
  },
  seo: {
    title: 'SICORA - Sistema de Coordinación Académica',
    description: 'Plataforma integral para la gestión académica de instituciones educativas',
    keywords: ['gestión académica', 'coordinación', 'horarios', 'educación'],
    canonicalUrl: 'https://sicora.onevision.com',
  },
  updatedAt: new Date().toISOString(),
};

// ============================================================================
// COLOR PRESETS
// ============================================================================

export interface ColorPreset {
  id: string;
  name: string;
  colors: ThemeColors;
  darkColors: ThemeColors;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'blue',
    name: 'Azul Corporativo',
    colors: {
      ...DEFAULT_THEME_COLORS,
      primary: '#3b82f6',
    },
    darkColors: {
      ...DEFAULT_DARK_THEME_COLORS,
      primary: '#60a5fa',
    },
  },
  {
    id: 'green',
    name: 'Verde Natural',
    colors: {
      ...DEFAULT_THEME_COLORS,
      primary: '#22c55e',
      accent: '#10b981',
    },
    darkColors: {
      ...DEFAULT_DARK_THEME_COLORS,
      primary: '#4ade80',
      accent: '#34d399',
    },
  },
  {
    id: 'purple',
    name: 'Púrpura Elegante',
    colors: {
      ...DEFAULT_THEME_COLORS,
      primary: '#8b5cf6',
      accent: '#a855f7',
    },
    darkColors: {
      ...DEFAULT_DARK_THEME_COLORS,
      primary: '#a78bfa',
      accent: '#c084fc',
    },
  },
  {
    id: 'orange',
    name: 'Naranja Energético',
    colors: {
      ...DEFAULT_THEME_COLORS,
      primary: '#f97316',
      accent: '#fb923c',
    },
    darkColors: {
      ...DEFAULT_DARK_THEME_COLORS,
      primary: '#fb923c',
      accent: '#fdba74',
    },
  },
  {
    id: 'teal',
    name: 'Teal Moderno',
    colors: {
      ...DEFAULT_THEME_COLORS,
      primary: '#14b8a6',
      accent: '#06b6d4',
    },
    darkColors: {
      ...DEFAULT_DARK_THEME_COLORS,
      primary: '#2dd4bf',
      accent: '#22d3ee',
    },
  },
  {
    id: 'rose',
    name: 'Rosa Suave',
    colors: {
      ...DEFAULT_THEME_COLORS,
      primary: '#f43f5e',
      accent: '#ec4899',
    },
    darkColors: {
      ...DEFAULT_DARK_THEME_COLORS,
      primary: '#fb7185',
      accent: '#f472b6',
    },
  },
];
