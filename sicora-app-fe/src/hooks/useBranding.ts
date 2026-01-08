/**
 * Hook para consumir configuración de branding
 * Proporciona acceso reactivo a nombre, logo, colores del sistema
 */

import { useEffect } from 'react';
import { useBrandingStore, useCurrentBranding } from '../stores/branding.store';
import type { ThemeColors } from '../types/branding.types';

/**
 * Hook principal para acceder a la configuración de branding
 * Se inicializa automáticamente al montar
 */
export function useBranding() {
  const { previewConfig, previewMode, isLoading, error, fetchBranding, applyThemeToDocument } =
    useBrandingStore();

  // Obtener config activa (preview o real)
  const activeConfig = useCurrentBranding();

  // Inicializar branding al montar
  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  // Aplicar tema cuando cambie la config
  useEffect(() => {
    if (activeConfig) {
      applyThemeToDocument();
    }
  }, [activeConfig, applyThemeToDocument]);

  return {
    // Configuración
    config: activeConfig,
    isLoading,
    error,

    // Valores comunes
    name: activeConfig.name,
    subtitle: activeConfig.subtitle,
    fullName: `${activeConfig.name} - ${activeConfig.subtitle}`,
    logo: activeConfig.logo,
    colors: activeConfig.theme.light,
    organization: activeConfig.organization,

    // Preview
    previewMode,
    previewConfig,

    // Métodos
    refresh: fetchBranding,
  };
}

/**
 * Hook para obtener solo el nombre del sistema
 * Útil para títulos y headers
 */
export function useBrandName(): string {
  const config = useCurrentBranding();
  return config.name;
}

/**
 * Hook para obtener URLs del logo
 * Maneja tema claro/oscuro automáticamente
 */
export function useBrandLogo(preferDark = false): string {
  const config = useCurrentBranding();

  if (preferDark && config.logo.dark) {
    return config.logo.dark;
  }

  return config.logo.primary;
}

/**
 * Hook para obtener colores del tema
 */
export function useBrandColors(): ThemeColors {
  const config = useCurrentBranding();
  return config.theme.light;
}

/**
 * Hook para obtener textos personalizados
 */
export function useBrandTexts() {
  const config = useCurrentBranding();

  return {
    welcomeMessage: config.texts.welcomeMessage,
    loginSubtitle: config.texts.loginSubtitle,
    dashboardTitle: config.texts.dashboardTitle,
    footerText: config.texts.footerText,
    copyright: config.texts.copyright.replace('{year}', new Date().getFullYear().toString()),
  };
}

/**
 * Hook para metadatos SEO
 */
export function useBrandSeo() {
  const config = useCurrentBranding();

  return {
    title: config.seo.title || config.name,
    description: config.seo.description || config.description,
    keywords: config.seo.keywords || [],
  };
}

/**
 * Utilidad para generar título de página con el nombre del sistema
 */
export function usePageTitle(pageTitle: string): string {
  const brandName = useBrandName();
  return `${pageTitle} | ${brandName}`;
}

/**
 * Hook para todo el contexto de branding
 * Incluye helpers y utilidades
 */
export function useBrandingContext() {
  const config = useCurrentBranding();
  const { previewMode, fetchBranding, isLoading } = useBrandingStore();

  return {
    // Config completa
    config,
    isLoading,
    previewMode,
    refresh: fetchBranding,

    // Shortcuts
    name: config.name,
    subtitle: config.subtitle,
    description: config.description,
    organization: config.organization,
    contactEmail: config.contactEmail,

    // Logo
    logo: config.logo.primary,
    logoDark: config.logo.dark,
    logoSmall: config.logo.small,
    favicon: config.logo.favicon,

    // Theme
    colors: config.theme.light,
    primaryColor: config.theme.light.primary,

    // Texts
    texts: config.texts,

    // SEO
    seo: config.seo,

    // Helpers
    getPageTitle: (page: string) => `${page} | ${config.name}`,
    getCopyright: () => config.texts.copyright.replace('{year}', String(new Date().getFullYear())),
  };
}
