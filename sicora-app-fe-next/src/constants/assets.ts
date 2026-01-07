/**
 * SENA Assets - Manual de Identidad Corporativa
 *
 * Constantes para el manejo de logos, iconos y otros assets
 * según el manual de identidad visual del SENA 2024
 */

// Logos SENA - Diferentes versiones según manual de identidad
export const SENA_LOGOS = {
  // Logo principal verde (uso preferente)
  PRIMARY: '/src/assets/images/logo-sena-verde-svg-2022.svg',

  // Logo verde complementario (para fondos específicos)
  COMPLEMENTARY: '/src/assets/images/logo-sena-verde-complementario-svg-2022.svg',

  // Logo negro (para fondos claros o impresión monocromática)
  BLACK: '/src/assets/images/logo-sena-negro-svg-2022.svg',

  // Logo naranja (ya no disponible en el directorio actual)
  // ORANGE: '/src/assets/images/logo-sena-naranja-svg-2022.svg',
} as const;

// Iconos y elementos gráficos
export const SENA_ICONS = {
  FAVICON: '/src/assets/images/favicon.ico',
  FAVICON_32: '/src/assets/images/favicon-32.png',
  FAVICON_48: '/src/assets/images/favicon-48.png',
  ICON: '/src/assets/images/icon.png',
  ADAPTIVE_ICON: '/src/assets/images/adaptive-icon.png',
  SPLASH_ICON: '/src/assets/images/splash-icon.png',
} as const;

// Imágenes por defecto
export const SENA_IMAGES = {
  DEFAULT_PROFILE: '/src/assets/images/default-profile.png',
  DEFAULT_PROFILE_SVG: '/src/assets/images/default-profile.svg',
} as const;

// Animaciones
export const SENA_ANIMATIONS = {
  LOADER: '/src/assets/animations/loader.json',
} as const;

// Fuentes locales
export const SENA_FONTS = {
  WORK_SANS: {
    VARIABLE: '/src/assets/fonts/Work_Sans/WorkSans-VariableFont_wght.ttf',
    VARIABLE_ITALIC: '/src/assets/fonts/Work_Sans/WorkSans-Italic-VariableFont_wght.ttf',
  },
  SPACE_MONO: {
    REGULAR: '/src/assets/fonts/SpaceMono-Regular.ttf',
  },
} as const;

// Colores oficiales SENA según manual de identidad
export const SENA_COLORS = {
  // Verde principal (color institucional)
  VERDE: {
    PRIMARY: '#39a900',
    DARK: '#2d7a00',
    LIGHT: '#5db025',
  },

  // Naranja complementario
  NARANJA: {
    PRIMARY: '#ff7300',
    DARK: '#cc5c00',
    LIGHT: '#ff8533',
  },

  // Colores secundarios
  VIOLETA: {
    PRIMARY: '#8b5fbf',
    DARK: '#6d4c93',
    LIGHT: '#a379d1',
  },

  AZUL: {
    PRIMARY: '#0066cc',
    DARK: '#0052a3',
    LIGHT: '#3385d6',
  },

  AMARILLO: {
    PRIMARY: '#fbbf24',
    DARK: '#f59e0b',
    LIGHT: '#fcd34d',
  },
} as const;

// Utilidad para obtener logo según contexto
export const getSenaLogo = (context: 'primary' | 'complementary' | 'black' = 'primary') => {
  switch (context) {
    case 'primary':
      return SENA_LOGOS.PRIMARY;
    case 'complementary':
      return SENA_LOGOS.COMPLEMENTARY;
    case 'black':
      return SENA_LOGOS.BLACK;
    default:
      return SENA_LOGOS.PRIMARY;
  }
};

// Utilidad para obtener favicon según tamaño
export const getSenaFavicon = (size?: '32' | '48') => {
  switch (size) {
    case '32':
      return SENA_ICONS.FAVICON_32;
    case '48':
      return SENA_ICONS.FAVICON_48;
    default:
      return SENA_ICONS.FAVICON;
  }
};
