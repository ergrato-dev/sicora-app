/**
 * API Client para configuración de Branding
 */

import { apiClient } from './client';
import type {
  BrandingConfig,
  UpdateBrandingRequest,
  UploadLogoResponse,
} from '../../types/branding.types';

const BASE_PATH = '/api/v1/admin/branding';

export const brandingApi = {
  /**
   * Obtener configuración actual de branding
   */
  getBranding: async (): Promise<BrandingConfig> => {
    const response = await apiClient.get<BrandingConfig>(BASE_PATH);
    return response.data;
  },

  /**
   * Actualizar configuración de branding
   */
  updateBranding: async (data: UpdateBrandingRequest): Promise<BrandingConfig> => {
    const response = await apiClient.put<BrandingConfig>(BASE_PATH, data);
    return response.data;
  },

  /**
   * Subir logo
   */
  uploadLogo: async (
    type: 'primary' | 'dark' | 'favicon' | 'small',
    file: File
  ): Promise<UploadLogoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.post<UploadLogoResponse>(`${BASE_PATH}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Eliminar logo
   */
  deleteLogo: async (type: 'primary' | 'dark' | 'favicon' | 'small'): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/logo/${type}`);
  },

  /**
   * Resetear a valores por defecto
   */
  resetToDefaults: async (): Promise<BrandingConfig> => {
    const response = await apiClient.post<BrandingConfig>(`${BASE_PATH}/reset`);
    return response.data;
  },

  /**
   * Exportar configuración
   */
  exportConfig: async (): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_PATH}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Importar configuración
   */
  importConfig: async (file: File): Promise<BrandingConfig> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<BrandingConfig>(`${BASE_PATH}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Previsualizar cambios (sin guardar)
   */
  previewChanges: async (data: UpdateBrandingRequest): Promise<BrandingConfig> => {
    const response = await apiClient.post<BrandingConfig>(`${BASE_PATH}/preview`, data);
    return response.data;
  },
};
