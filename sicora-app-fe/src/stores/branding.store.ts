/**
 * Store Zustand para configuración de Branding
 * Permite gestión dinámica del tema y branding desde admin
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BrandingConfig, ThemeColors, UpdateBrandingRequest } from '../types/branding.types';
import { DEFAULT_BRANDING, COLOR_PRESETS } from '../types/branding.types';

interface BrandingState {
  // Estado
  config: BrandingConfig;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  previewMode: boolean;
  previewConfig: BrandingConfig | null;

  // Acciones de carga
  fetchBranding: () => Promise<void>;
  updateBranding: (data: UpdateBrandingRequest) => Promise<void>;
  resetToDefaults: () => Promise<void>;

  // Acciones locales (preview)
  setPreviewMode: (enabled: boolean) => void;
  previewChanges: (data: Partial<BrandingConfig>) => void;
  applyPreview: () => Promise<void>;
  cancelPreview: () => void;

  // Helpers
  setName: (name: string) => void;
  setSubtitle: (subtitle: string) => void;
  setLogo: (type: 'primary' | 'dark' | 'small', url: string) => void;
  setThemeColors: (mode: 'light' | 'dark', colors: Partial<ThemeColors>) => void;
  applyColorPreset: (presetId: string) => void;
  applyThemeToDocument: () => void;

  // Control de errores
  clearError: () => void;
  setDirty: (dirty: boolean) => void;
}

// Aplicar colores CSS al documento
const applyThemeToDocument = (config: BrandingConfig) => {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const colors = isDark ? config.theme.dark : config.theme.light;

  // Aplicar colores como variables CSS
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-foreground', colors.primaryForeground);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--color-destructive', colors.destructive);
  root.style.setProperty('--color-destructive-foreground', colors.destructiveForeground);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-foreground', colors.accentForeground);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-info', colors.info);

  // Actualizar título del documento
  document.title = config.seo.title || config.name;

  // Actualizar favicon si existe
  if (config.logo.favicon) {
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.setAttribute('href', config.logo.favicon);
    }
  }
};

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      config: DEFAULT_BRANDING,
      isLoading: false,
      error: null,
      isDirty: false,
      previewMode: false,
      previewConfig: null,

      // Cargar configuración desde API
      fetchBranding: async () => {
        set({ isLoading: true, error: null });

        try {
          // Por ahora, usar localStorage como fallback
          // En producción, esto llamaría a brandingApi.getBranding()
          const stored = localStorage.getItem('sicora-branding');
          if (stored) {
            const config = JSON.parse(stored) as BrandingConfig;
            set({ config, isLoading: false });
            applyThemeToDocument(config);
          } else {
            set({ config: DEFAULT_BRANDING, isLoading: false });
            applyThemeToDocument(DEFAULT_BRANDING);
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cargar configuración',
            isLoading: false,
          });
        }
      },

      // Actualizar configuración
      updateBranding: async (data) => {
        const { config } = get();
        set({ isLoading: true, error: null });

        try {
          const updatedConfig: BrandingConfig = {
            ...config,
            ...data,
            logo: { ...config.logo, ...data.logo },
            theme: {
              ...config.theme,
              ...data.theme,
              light: { ...config.theme.light, ...data.theme?.light },
              dark: { ...config.theme.dark, ...data.theme?.dark },
            },
            texts: { ...config.texts, ...data.texts },
            seo: { ...config.seo, ...data.seo },
            updatedAt: new Date().toISOString(),
          };

          // Guardar en localStorage (en producción, API)
          localStorage.setItem('sicora-branding', JSON.stringify(updatedConfig));

          set({ config: updatedConfig, isLoading: false, isDirty: false });
          applyThemeToDocument(updatedConfig);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al guardar configuración',
            isLoading: false,
          });
        }
      },

      // Resetear a valores por defecto
      resetToDefaults: async () => {
        set({ isLoading: true, error: null });

        try {
          localStorage.removeItem('sicora-branding');
          set({
            config: DEFAULT_BRANDING,
            isLoading: false,
            isDirty: false,
            previewMode: false,
            previewConfig: null,
          });
          applyThemeToDocument(DEFAULT_BRANDING);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al resetear configuración',
            isLoading: false,
          });
        }
      },

      // Modo preview
      setPreviewMode: (enabled) => {
        const { config, previewConfig } = get();
        if (enabled) {
          set({ previewMode: true, previewConfig: { ...config } });
        } else {
          set({ previewMode: false });
          if (previewConfig) {
            applyThemeToDocument(config);
          }
        }
      },

      previewChanges: (data) => {
        const { config, previewMode } = get();
        if (!previewMode) return;

        const preview: BrandingConfig = {
          ...config,
          ...data,
          logo: { ...config.logo, ...data.logo },
          theme: data.theme
            ? {
                ...config.theme,
                ...data.theme,
              }
            : config.theme,
          texts: { ...config.texts, ...data.texts },
          seo: { ...config.seo, ...data.seo },
          updatedAt: config.updatedAt,
        };

        set({ previewConfig: preview, isDirty: true });
        applyThemeToDocument(preview);
      },

      applyPreview: async () => {
        const { previewConfig, updateBranding } = get();
        if (previewConfig) {
          await updateBranding(previewConfig);
          set({ previewMode: false, previewConfig: null });
        }
      },

      cancelPreview: () => {
        const { config } = get();
        set({ previewMode: false, previewConfig: null, isDirty: false });
        applyThemeToDocument(config);
      },

      // Helpers rápidos
      setName: (name) => {
        const { previewMode, previewChanges, updateBranding } = get();
        if (previewMode) {
          previewChanges({ name });
        } else {
          updateBranding({ name });
        }
      },

      setSubtitle: (subtitle) => {
        const { previewMode, previewChanges, updateBranding } = get();
        if (previewMode) {
          previewChanges({ subtitle });
        } else {
          updateBranding({ subtitle });
        }
      },

      setLogo: (type, url) => {
        const { config, previewMode, previewChanges, updateBranding } = get();
        const logoUpdate = { ...config.logo, [type]: url };

        if (previewMode) {
          previewChanges({ logo: logoUpdate });
        } else {
          updateBranding({ logo: logoUpdate });
        }
      },

      setThemeColors: (mode, colors) => {
        const { config, previewMode, previewChanges, updateBranding } = get();
        const themeUpdate = {
          ...config.theme,
          [mode]: { ...config.theme[mode], ...colors },
        };

        if (previewMode) {
          previewChanges({ theme: themeUpdate });
        } else {
          updateBranding({ theme: themeUpdate });
        }
      },

      applyColorPreset: (presetId) => {
        const preset = COLOR_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;

        const { config, previewMode, previewChanges, updateBranding } = get();
        const themeUpdate = {
          ...config.theme,
          name: preset.name,
          light: preset.colors,
          dark: preset.darkColors,
        };

        if (previewMode) {
          previewChanges({ theme: themeUpdate });
        } else {
          updateBranding({ theme: themeUpdate });
        }
      },

      // Control de errores
      clearError: () => set({ error: null }),
      setDirty: (dirty) => set({ isDirty: dirty }),

      // Aplicar tema al documento
      applyThemeToDocument: () => {
        const { config, previewMode, previewConfig } = get();
        const activeConfig = previewMode && previewConfig ? previewConfig : config;
        applyThemeToDocument(activeConfig);
      },
    }),
    {
      name: 'sicora-branding-store',
      partialize: (state) => ({ config: state.config }),
    }
  )
);

// Hook para obtener la configuración actual (usa preview si está activo)
export const useCurrentBranding = () => {
  const { config, previewMode, previewConfig } = useBrandingStore();
  return previewMode && previewConfig ? previewConfig : config;
};
