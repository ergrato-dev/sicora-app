/**
 * Configuración de marca dual EPTI/SENA
 * Sistema que permite cambiar entre configuraciones sin modificar código
 */

export interface BrandConfig {
  name: string;
  subtitle: string;
  description: string;
  showLogo: boolean;
  buildTarget: 'development' | 'hostinger' | 'sena';
  organization: string;
  organizationFull: string;
  contactEmail: string;
  supportUrl: string;
  docsUrl: string;
}

export const BRAND_CONFIG: BrandConfig = {
  name: import.meta.env.VITE_BRAND_NAME || 'EPTI - ONEVISION',
  subtitle: import.meta.env.VITE_BRAND_SUBTITLE || 'Sistema de Coordinación Académica',
  description:
    import.meta.env.VITE_BRAND_DESCRIPTION || 'Plataforma integral para la gestión académica',
  showLogo: import.meta.env.VITE_SHOW_LOGO === 'true',
  buildTarget: (import.meta.env.VITE_BUILD_TARGET as BrandConfig['buildTarget']) || 'development',
  organization: import.meta.env.VITE_ORGANIZATION || 'EPTI',
  organizationFull:
    import.meta.env.VITE_ORGANIZATION_FULL ||
    'EPTI - Plataforma de Desarrollo y Tecnologías de la Información',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'demo@ejemplo.local',
  supportUrl: import.meta.env.VITE_SUPPORT_URL || 'http://localhost:5173/soporte',
  docsUrl: import.meta.env.VITE_DOCS_URL || 'http://localhost:5173/docs',
};

/**
 * Helpers para identificar el entorno
 */
export const IS_SENA_BUILD = BRAND_CONFIG.buildTarget === 'sena';
export const IS_HOSTINGER_BUILD = BRAND_CONFIG.buildTarget === 'hostinger';
export const IS_DEVELOPMENT = BRAND_CONFIG.buildTarget === 'development';

/**
 * Configuración de URLs específicas por entorno
 */
export const BRAND_URLS = {
  home: IS_SENA_BUILD ? 'https://sicora.sena.edu.co' : 'https://epti.onevision.com.co',
  support: BRAND_CONFIG.supportUrl,
  docs: BRAND_CONFIG.docsUrl,
  contact: '/contacto-seguro', // Enlace a página de contacto seguro
} as const;

/**
 * Textos adaptativos según la marca
 */
export const BRAND_TEXTS = {
  welcomeMessage: IS_SENA_BUILD
    ? '¡Bienvenido al Sistema SICORA!'
    : '¡Bienvenido a EPTI - ONEVISION!',

  footerText: IS_SENA_BUILD
    ? `© ${new Date().getFullYear()} OneVision - OneVision Open Source. Todos los derechos reservados.`
    : `© ${new Date().getFullYear()} EPTI - Plataforma de Desarrollo y Tecnologías de la Información. Todos los derechos reservados.`,

  loginSubtitle: IS_SENA_BUILD
    ? 'Accede al Sistema de Información de Coordinación Académica'
    : 'Accede al Sistema de Coordinación Académica EPTI',

  dashboardTitle: IS_SENA_BUILD ? 'Panel de Coordinación Académica' : 'Panel de Control EPTI',

  systemDescription: IS_SENA_BUILD
    ? 'Sistema integral de gestión académica del CGMLTI'
    : 'Plataforma moderna de gestión académica',
} as const;

export default BRAND_CONFIG;
