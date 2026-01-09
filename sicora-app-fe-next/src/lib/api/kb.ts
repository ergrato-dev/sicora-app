/**
 * Cliente API para KbService - Knowledge Base
 * 
 * Nota: Usamos non-null assertion (!) en response.data porque:
 * - ApiResponse<T> tiene data como opcional para manejar casos de error
 * - En llamadas exitosas, data siempre estará presente
 * - httpClient lanza excepción en caso de error antes de retornar
 */

import { httpClient } from '../api-client';
import type {
  KBDocument,
  KBCategory,
  KBTag,
  FAQ,
  ContentRating,
  ContentBookmark,
  SearchResult,
  SearchResponse,
  ContentStats,
  EngagementStats,
  SearchStats,
  TopContent,
  ContentTrend,
  ContentGap,
  UnansweredQuestion,
  KBReport,
  RealtimeStats,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CreateFAQRequest,
  UpdateFAQRequest,
  CreateCategoryRequest,
  CreateTagRequest,
  SearchDocumentsParams,
  SearchFAQsParams,
  AnalyticsParams,
  RateContentRequest,
  GenerateReportRequest,
  PaginatedDocuments,
  PaginatedFAQs,
} from '@/types/kb.types';

const BASE_URL = '/api/v1';

// Helper para construir query string
function buildQueryString(params: Record<string, unknown>): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join('&');
  return query ? `?${query}` : '';
}

// ============================================================================
// CATEGORÍAS
// ============================================================================

/**
 * Listar todas las categorías
 */
export async function listCategories(): Promise<KBCategory[]> {
  const response = await httpClient.get<KBCategory[]>(`${BASE_URL}/categories`);
  return response.data!;
}

/**
 * Obtener una categoría por ID
 */
export async function getCategory(id: string): Promise<KBCategory> {
  const response = await httpClient.get<KBCategory>(`${BASE_URL}/categories/${id}`);
  return response.data!;
}

/**
 * Crear una nueva categoría
 */
export async function createCategory(data: CreateCategoryRequest): Promise<KBCategory> {
  const response = await httpClient.post<KBCategory>(`${BASE_URL}/categories`, data);
  return response.data!;
}

/**
 * Actualizar una categoría
 */
export async function updateCategory(
  id: string,
  data: Partial<CreateCategoryRequest>
): Promise<KBCategory> {
  const response = await httpClient.put<KBCategory>(`${BASE_URL}/categories/${id}`, data);
  return response.data!;
}

/**
 * Eliminar una categoría
 */
export async function deleteCategory(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/categories/${id}`);
}

// ============================================================================
// TAGS
// ============================================================================

/**
 * Listar todos los tags
 */
export async function listTags(): Promise<KBTag[]> {
  const response = await httpClient.get<KBTag[]>(`${BASE_URL}/tags`);
  return response.data!;
}

/**
 * Obtener un tag por ID
 */
export async function getTag(id: string): Promise<KBTag> {
  const response = await httpClient.get<KBTag>(`${BASE_URL}/tags/${id}`);
  return response.data!;
}

/**
 * Crear un nuevo tag
 */
export async function createTag(data: CreateTagRequest): Promise<KBTag> {
  const response = await httpClient.post<KBTag>(`${BASE_URL}/tags`, data);
  return response.data!;
}

/**
 * Eliminar un tag
 */
export async function deleteTag(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/tags/${id}`);
}

// ============================================================================
// DOCUMENTOS
// ============================================================================

/**
 * Crear un nuevo documento
 */
export async function createDocument(data: CreateDocumentRequest): Promise<KBDocument> {
  const response = await httpClient.post<KBDocument>(`${BASE_URL}/documents`, data);
  return response.data!;
}

/**
 * Obtener un documento por ID
 */
export async function getDocument(id: string): Promise<KBDocument> {
  const response = await httpClient.get<KBDocument>(`${BASE_URL}/documents/${id}`);
  return response.data!;
}

/**
 * Obtener un documento por slug
 */
export async function getDocumentBySlug(slug: string): Promise<KBDocument> {
  const response = await httpClient.get<KBDocument>(`${BASE_URL}/docs/${slug}`);
  return response.data!;
}

/**
 * Actualizar un documento
 */
export async function updateDocument(
  id: string,
  data: UpdateDocumentRequest
): Promise<KBDocument> {
  const response = await httpClient.put<KBDocument>(`${BASE_URL}/documents/${id}`, data);
  return response.data!;
}

/**
 * Eliminar un documento
 */
export async function deleteDocument(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/documents/${id}`);
}

/**
 * Buscar documentos con filtros
 */
export async function searchDocuments(params: SearchDocumentsParams): Promise<PaginatedDocuments> {
  const queryString = buildQueryString(params as Record<string, unknown>);
  const response = await httpClient.get<PaginatedDocuments>(`${BASE_URL}/documents${queryString}`);
  return response.data!;
}

/**
 * Búsqueda semántica de documentos
 */
export async function semanticSearchDocuments(query: string, limit?: number): Promise<SearchResult[]> {
  const response = await httpClient.post<SearchResult[]>(`${BASE_URL}/documents/search/semantic`, {
    query,
    limit: limit ?? 10,
  });
  return response.data!;
}

// ============================================================================
// WORKFLOW DE DOCUMENTOS
// ============================================================================

/**
 * Enviar documento a revisión
 */
export async function submitDocumentForReview(id: string): Promise<KBDocument> {
  const response = await httpClient.post<KBDocument>(`${BASE_URL}/documents/${id}/submit-for-review`, {});
  return response.data!;
}

/**
 * Aprobar documento
 */
export async function approveDocument(id: string, comments?: string): Promise<KBDocument> {
  const response = await httpClient.post<KBDocument>(`${BASE_URL}/documents/${id}/approve`, {
    comments,
  });
  return response.data!;
}

/**
 * Publicar documento
 */
export async function publishDocument(id: string): Promise<KBDocument> {
  const response = await httpClient.post<KBDocument>(`${BASE_URL}/documents/${id}/publish`, {});
  return response.data!;
}

/**
 * Archivar documento
 */
export async function archiveDocument(id: string): Promise<KBDocument> {
  const response = await httpClient.post<KBDocument>(`${BASE_URL}/documents/${id}/archive`, {});
  return response.data!;
}

/**
 * Obtener analytics de un documento
 */
export async function getDocumentAnalytics(id: string): Promise<EngagementStats> {
  const response = await httpClient.get<EngagementStats>(`${BASE_URL}/documents/${id}/analytics`);
  return response.data!;
}

// ============================================================================
// CALIFICACIONES Y BOOKMARKS
// ============================================================================

/**
 * Calificar un documento
 */
export async function rateDocument(id: string, data: RateContentRequest): Promise<ContentRating> {
  const response = await httpClient.post<ContentRating>(`${BASE_URL}/documents/${id}/rate`, data);
  return response.data!;
}

/**
 * Calificar una FAQ
 */
export async function rateFAQ(id: string, data: RateContentRequest): Promise<ContentRating> {
  const response = await httpClient.post<ContentRating>(`${BASE_URL}/faqs/${id}/rate`, data);
  return response.data!;
}

/**
 * Agregar bookmark a documento
 */
export async function bookmarkDocument(id: string, notes?: string): Promise<ContentBookmark> {
  const response = await httpClient.post<ContentBookmark>(`${BASE_URL}/documents/${id}/bookmark`, {
    notes,
  });
  return response.data!;
}

/**
 * Eliminar bookmark de documento
 */
export async function removeDocumentBookmark(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/documents/${id}/bookmark`);
}

/**
 * Obtener bookmarks del usuario
 */
export async function getMyBookmarks(): Promise<ContentBookmark[]> {
  const response = await httpClient.get<ContentBookmark[]>(`${BASE_URL}/bookmarks`);
  return response.data!;
}

// ============================================================================
// FAQs
// ============================================================================

/**
 * Crear una nueva FAQ
 */
export async function createFAQ(data: CreateFAQRequest): Promise<FAQ> {
  const response = await httpClient.post<FAQ>(`${BASE_URL}/faqs`, data);
  return response.data!;
}

/**
 * Obtener una FAQ por ID
 */
export async function getFAQ(id: string): Promise<FAQ> {
  const response = await httpClient.get<FAQ>(`${BASE_URL}/faqs/${id}`);
  return response.data!;
}

/**
 * Actualizar una FAQ
 */
export async function updateFAQ(id: string, data: UpdateFAQRequest): Promise<FAQ> {
  const response = await httpClient.put<FAQ>(`${BASE_URL}/faqs/${id}`, data);
  return response.data!;
}

/**
 * Eliminar una FAQ
 */
export async function deleteFAQ(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/faqs/${id}`);
}

/**
 * Buscar FAQs con filtros
 */
export async function searchFAQs(params: SearchFAQsParams): Promise<PaginatedFAQs> {
  const queryString = buildQueryString(params as Record<string, unknown>);
  const response = await httpClient.get<PaginatedFAQs>(`${BASE_URL}/faqs${queryString}`);
  return response.data!;
}

/**
 * Búsqueda semántica de FAQs
 */
export async function semanticSearchFAQs(query: string, limit?: number): Promise<SearchResult[]> {
  const response = await httpClient.post<SearchResult[]>(`${BASE_URL}/faqs/search/semantic`, {
    query,
    limit: limit ?? 10,
  });
  return response.data!;
}

/**
 * Obtener FAQs populares
 */
export async function getPopularFAQs(limit?: number): Promise<FAQ[]> {
  const queryString = limit ? `?limit=${limit}` : '';
  const response = await httpClient.get<FAQ[]>(`${BASE_URL}/faqs/popular${queryString}`);
  return response.data!;
}

/**
 * Obtener FAQs trending
 */
export async function getTrendingFAQs(limit?: number): Promise<FAQ[]> {
  const queryString = limit ? `?limit=${limit}` : '';
  const response = await httpClient.get<FAQ[]>(`${BASE_URL}/faqs/trending${queryString}`);
  return response.data!;
}

/**
 * Publicar FAQ
 */
export async function publishFAQ(id: string): Promise<FAQ> {
  const response = await httpClient.post<FAQ>(`${BASE_URL}/faqs/${id}/publish`, {});
  return response.data!;
}

/**
 * Obtener analytics de una FAQ
 */
export async function getFAQAnalytics(id: string): Promise<EngagementStats> {
  const response = await httpClient.get<EngagementStats>(`${BASE_URL}/faqs/${id}/analytics`);
  return response.data!;
}

/**
 * Obtener FAQs relacionadas
 */
export async function getRelatedFAQs(id: string, limit?: number): Promise<FAQ[]> {
  const queryString = limit ? `?limit=${limit}` : '';
  const response = await httpClient.get<FAQ[]>(`${BASE_URL}/faqs/${id}/related${queryString}`);
  return response.data!;
}

// ============================================================================
// BÚSQUEDA UNIFICADA
// ============================================================================

/**
 * Búsqueda unificada (documentos + FAQs)
 */
export async function search(query: string, params?: {
  type?: 'all' | 'document' | 'faq';
  categoryId?: string;
  searchType?: 'keyword' | 'semantic' | 'hybrid';
  page?: number;
  limit?: number;
}): Promise<SearchResponse> {
  const queryString = buildQueryString({ query, ...params } as Record<string, unknown>);
  const response = await httpClient.get<SearchResponse>(`${BASE_URL}/kb/search${queryString}`);
  return response.data!;
}

/**
 * Obtener sugerencias de búsqueda
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  const response = await httpClient.get<string[]>(`${BASE_URL}/kb/suggestions?query=${encodeURIComponent(query)}`);
  return response.data!;
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Obtener estadísticas de contenido
 */
export async function getContentStats(params?: AnalyticsParams): Promise<ContentStats> {
  const queryString = buildQueryString(params as Record<string, unknown> ?? {});
  const response = await httpClient.get<ContentStats>(`${BASE_URL}/analytics/content${queryString}`);
  return response.data!;
}

/**
 * Obtener estadísticas de engagement
 */
export async function getEngagementStats(params?: AnalyticsParams): Promise<EngagementStats> {
  const queryString = buildQueryString(params as Record<string, unknown> ?? {});
  const response = await httpClient.get<EngagementStats>(`${BASE_URL}/analytics/engagement${queryString}`);
  return response.data!;
}

/**
 * Obtener estadísticas de búsqueda
 */
export async function getSearchStats(params?: AnalyticsParams): Promise<SearchStats> {
  const queryString = buildQueryString(params as Record<string, unknown> ?? {});
  const response = await httpClient.get<SearchStats>(`${BASE_URL}/analytics/search${queryString}`);
  return response.data!;
}

/**
 * Obtener contenido más visto
 */
export async function getTopContent(params?: AnalyticsParams): Promise<TopContent[]> {
  const queryString = buildQueryString(params as Record<string, unknown> ?? {});
  const response = await httpClient.get<TopContent[]>(`${BASE_URL}/analytics/top-content${queryString}`);
  return response.data!;
}

/**
 * Obtener tendencias
 */
export async function getTrends(params?: AnalyticsParams): Promise<ContentTrend> {
  const queryString = buildQueryString(params as Record<string, unknown> ?? {});
  const response = await httpClient.get<ContentTrend>(`${BASE_URL}/analytics/trends${queryString}`);
  return response.data!;
}

/**
 * Obtener preguntas sin respuesta
 */
export async function getUnansweredQuestions(params?: {
  status?: 'pending' | 'in_progress' | 'answered' | 'ignored';
  limit?: number;
}): Promise<UnansweredQuestion[]> {
  const queryString = buildQueryString(params as Record<string, unknown> ?? {});
  const response = await httpClient.get<UnansweredQuestion[]>(
    `${BASE_URL}/analytics/unanswered-questions${queryString}`
  );
  return response.data!;
}

/**
 * Obtener brechas de contenido
 */
export async function getContentGaps(params?: {
  priority?: 'high' | 'medium' | 'low';
  limit?: number;
}): Promise<ContentGap[]> {
  const queryString = buildQueryString(params as Record<string, unknown> ?? {});
  const response = await httpClient.get<ContentGap[]>(`${BASE_URL}/analytics/content-gaps${queryString}`);
  return response.data!;
}

/**
 * Obtener estadísticas en tiempo real
 */
export async function getRealtimeStats(): Promise<RealtimeStats> {
  const response = await httpClient.get<RealtimeStats>(`${BASE_URL}/analytics/realtime`);
  return response.data!;
}

// ============================================================================
// REPORTES
// ============================================================================

/**
 * Generar reporte
 */
export async function generateReport(data: GenerateReportRequest): Promise<KBReport> {
  const response = await httpClient.post<KBReport>(`${BASE_URL}/analytics/reports`, data);
  return response.data!;
}

/**
 * Listar reportes programados
 */
export async function listReports(): Promise<KBReport[]> {
  const response = await httpClient.get<KBReport[]>(`${BASE_URL}/analytics/reports`);
  return response.data!;
}

/**
 * Obtener un reporte por ID
 */
export async function getReport(id: string): Promise<KBReport> {
  const response = await httpClient.get<KBReport>(`${BASE_URL}/analytics/reports/${id}`);
  return response.data!;
}

/**
 * Eliminar un reporte
 */
export async function deleteReport(id: string): Promise<void> {
  await httpClient.delete(`${BASE_URL}/analytics/reports/${id}`);
}

// ============================================================================
// EXPORTACIÓN AGRUPADA
// ============================================================================

export const kbApi = {
  // Categorías
  categories: {
    list: listCategories,
    get: getCategory,
    create: createCategory,
    update: updateCategory,
    delete: deleteCategory,
  },
  // Tags
  tags: {
    list: listTags,
    get: getTag,
    create: createTag,
    delete: deleteTag,
  },
  // Documentos
  documents: {
    create: createDocument,
    get: getDocument,
    getBySlug: getDocumentBySlug,
    update: updateDocument,
    delete: deleteDocument,
    search: searchDocuments,
    semanticSearch: semanticSearchDocuments,
    submitForReview: submitDocumentForReview,
    approve: approveDocument,
    publish: publishDocument,
    archive: archiveDocument,
    getAnalytics: getDocumentAnalytics,
    rate: rateDocument,
    bookmark: bookmarkDocument,
    removeBookmark: removeDocumentBookmark,
  },
  // FAQs
  faqs: {
    create: createFAQ,
    get: getFAQ,
    update: updateFAQ,
    delete: deleteFAQ,
    search: searchFAQs,
    semanticSearch: semanticSearchFAQs,
    getPopular: getPopularFAQs,
    getTrending: getTrendingFAQs,
    publish: publishFAQ,
    getAnalytics: getFAQAnalytics,
    getRelated: getRelatedFAQs,
    rate: rateFAQ,
  },
  // Búsqueda
  search: {
    unified: search,
    suggestions: getSearchSuggestions,
  },
  // Bookmarks
  bookmarks: {
    getAll: getMyBookmarks,
  },
  // Analytics
  analytics: {
    content: getContentStats,
    engagement: getEngagementStats,
    search: getSearchStats,
    topContent: getTopContent,
    trends: getTrends,
    unansweredQuestions: getUnansweredQuestions,
    contentGaps: getContentGaps,
    realtime: getRealtimeStats,
  },
  // Reportes
  reports: {
    generate: generateReport,
    list: listReports,
    get: getReport,
    delete: deleteReport,
  },
};
