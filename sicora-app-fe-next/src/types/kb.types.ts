/**
 * Tipos para KbService - Knowledge Base
 * Base de conocimiento con documentos, FAQs y analytics
 */

// ============================================================================
// ENUMS Y CONSTANTES
// ============================================================================

/**
 * Estado del documento
 */
export type DocumentStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';

/**
 * Tipo de documento
 */
export type DocumentType = 'article' | 'guide' | 'tutorial' | 'policy' | 'procedure' | 'faq' | 'announcement';

/**
 * Visibilidad del documento
 */
export type DocumentVisibility = 'public' | 'authenticated' | 'role_restricted' | 'private';

/**
 * Estado de FAQ
 */
export type FAQStatus = 'draft' | 'published' | 'archived';

/**
 * Categoría de contenido
 */
export type ContentCategory = 
  | 'academic' 
  | 'administrative' 
  | 'technical' 
  | 'policies' 
  | 'procedures' 
  | 'help' 
  | 'general';

/**
 * Tipo de búsqueda
 */
export type SearchType = 'keyword' | 'semantic' | 'hybrid';

// ============================================================================
// CONFIGURACIONES DE UI
// ============================================================================

export const DOCUMENT_STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Borrador', color: 'gray', icon: 'FileEdit' },
  pending_review: { label: 'En Revisión', color: 'amber', icon: 'Clock' },
  approved: { label: 'Aprobado', color: 'blue', icon: 'CheckCircle' },
  published: { label: 'Publicado', color: 'green', icon: 'Globe' },
  archived: { label: 'Archivado', color: 'slate', icon: 'Archive' },
};

export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { label: string; icon: string; description: string }> = {
  article: { label: 'Artículo', icon: 'FileText', description: 'Artículos informativos' },
  guide: { label: 'Guía', icon: 'BookOpen', description: 'Guías paso a paso' },
  tutorial: { label: 'Tutorial', icon: 'GraduationCap', description: 'Tutoriales prácticos' },
  policy: { label: 'Política', icon: 'Shield', description: 'Políticas institucionales' },
  procedure: { label: 'Procedimiento', icon: 'ClipboardList', description: 'Procedimientos operativos' },
  faq: { label: 'FAQ', icon: 'HelpCircle', description: 'Preguntas frecuentes' },
  announcement: { label: 'Anuncio', icon: 'Megaphone', description: 'Comunicados y anuncios' },
};

export const CONTENT_CATEGORY_CONFIG: Record<ContentCategory, { label: string; icon: string; color: string }> = {
  academic: { label: 'Académico', icon: 'GraduationCap', color: 'blue' },
  administrative: { label: 'Administrativo', icon: 'Building', color: 'purple' },
  technical: { label: 'Técnico', icon: 'Settings', color: 'slate' },
  policies: { label: 'Políticas', icon: 'Shield', color: 'red' },
  procedures: { label: 'Procedimientos', icon: 'ClipboardList', color: 'amber' },
  help: { label: 'Ayuda', icon: 'HelpCircle', color: 'green' },
  general: { label: 'General', icon: 'Info', color: 'gray' },
};

export const VISIBILITY_CONFIG: Record<DocumentVisibility, { label: string; icon: string; description: string }> = {
  public: { label: 'Público', icon: 'Globe', description: 'Visible para todos' },
  authenticated: { label: 'Autenticado', icon: 'User', description: 'Solo usuarios autenticados' },
  role_restricted: { label: 'Por Rol', icon: 'Users', description: 'Restringido a roles específicos' },
  private: { label: 'Privado', icon: 'Lock', description: 'Solo el autor y admins' },
};

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

/**
 * Categoría de documentos/FAQs
 */
export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  documentCount: number;
  faqCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tag para documentos/FAQs
 */
export interface KBTag {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
  createdAt: string;
}

/**
 * Autor del documento
 */
export interface DocumentAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

/**
 * Documento de la base de conocimiento
 */
export interface KBDocument {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  type: DocumentType;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  categoryId: string;
  category?: KBCategory;
  tags: KBTag[];
  author: DocumentAuthor;
  reviewerId?: string;
  reviewer?: DocumentAuthor;
  
  // Metadatos
  featuredImage?: string;
  attachments?: DocumentAttachment[];
  readingTimeMinutes: number;
  wordCount: number;
  
  // Restricciones
  allowedRoles?: string[];
  allowedPrograms?: string[];
  
  // Analytics
  viewCount: number;
  uniqueViewCount: number;
  rating: number;
  ratingCount: number;
  bookmarkCount: number;
  shareCount: number;
  
  // Versioning
  version: number;
  previousVersionId?: string;
  
  // Fechas
  publishedAt?: string;
  reviewedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Adjunto de documento
 */
export interface DocumentAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

/**
 * FAQ - Pregunta Frecuente
 */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  slug: string;
  categoryId: string;
  category?: KBCategory;
  tags: KBTag[];
  status: FAQStatus;
  
  // Analytics
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  rating: number;
  
  // Metadata
  author: DocumentAuthor;
  sortOrder: number;
  isFeatured: boolean;
  isPinned: boolean;
  
  // Relacionados
  relatedFAQs?: string[];
  relatedDocuments?: string[];
  
  // Fechas
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Calificación de documento/FAQ
 */
export interface ContentRating {
  id: string;
  contentType: 'document' | 'faq';
  contentId: string;
  userId: string;
  rating: number;
  feedback?: string;
  isHelpful?: boolean;
  createdAt: string;
}

/**
 * Vista de documento/FAQ
 */
export interface ContentView {
  id: string;
  contentType: 'document' | 'faq';
  contentId: string;
  userId?: string;
  sessionId: string;
  duration?: number;
  scrollDepth?: number;
  source?: string;
  searchQuery?: string;
  viewedAt: string;
}

/**
 * Bookmark de documento/FAQ
 */
export interface ContentBookmark {
  id: string;
  contentType: 'document' | 'faq';
  contentId: string;
  userId: string;
  notes?: string;
  createdAt: string;
}

// ============================================================================
// TIPOS DE BÚSQUEDA
// ============================================================================

/**
 * Resultado de búsqueda
 */
export interface SearchResult {
  id: string;
  type: 'document' | 'faq';
  title: string;
  excerpt: string;
  slug: string;
  categoryName: string;
  tags: string[];
  score: number;
  highlights?: {
    title?: string;
    content?: string;
  };
  viewCount: number;
  rating: number;
  publishedAt: string;
}

/**
 * Sugerencia de búsqueda
 */
export interface SearchSuggestion {
  text: string;
  type: 'query' | 'document' | 'faq' | 'category' | 'tag';
  count?: number;
}

/**
 * Búsqueda reciente
 */
export interface RecentSearch {
  query: string;
  timestamp: string;
  resultCount: number;
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Estadísticas de contenido
 */
export interface ContentStats {
  totalDocuments: number;
  totalFAQs: number;
  totalCategories: number;
  publishedDocuments: number;
  draftDocuments: number;
  pendingReviewDocuments: number;
  totalViews: number;
  totalRatings: number;
  averageRating: number;
  documentsByType: { type: DocumentType; count: number }[];
  documentsByCategory: { categoryId: string; categoryName: string; count: number }[];
  documentsByStatus: { status: DocumentStatus; count: number }[];
}

/**
 * Estadísticas de engagement
 */
export interface EngagementStats {
  periodStart: string;
  periodEnd: string;
  totalViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  searchCount: number;
  ratingCount: number;
  bookmarkCount: number;
  shareCount: number;
  viewsByDay: { date: string; views: number; uniqueVisitors: number }[];
  topReferers: { source: string; count: number }[];
}

/**
 * Estadísticas de búsqueda
 */
export interface SearchStats {
  totalSearches: number;
  uniqueSearches: number;
  searchesWithResults: number;
  searchesWithoutResults: number;
  averageResultsPerSearch: number;
  clickThroughRate: number;
  topQueries: { query: string; count: number; avgResults: number }[];
  zeroResultQueries: { query: string; count: number }[];
  searchesByDay: { date: string; count: number }[];
}

/**
 * Contenido más visto
 */
export interface TopContent {
  id: string;
  type: 'document' | 'faq';
  title: string;
  slug: string;
  viewCount: number;
  uniqueViewCount: number;
  rating: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

/**
 * Tendencias de contenido
 */
export interface ContentTrend {
  period: string;
  topViewedDocuments: TopContent[];
  topRatedDocuments: TopContent[];
  topSearchQueries: { query: string; count: number }[];
  growingTopics: { topic: string; growth: number }[];
  decliningTopics: { topic: string; decline: number }[];
}

/**
 * Brecha de contenido identificada
 */
export interface ContentGap {
  id: string;
  query: string;
  searchCount: number;
  noResultsCount: number;
  suggestedCategory?: string;
  suggestedTags?: string[];
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

/**
 * Pregunta sin responder
 */
export interface UnansweredQuestion {
  id: string;
  question: string;
  searchCount: number;
  lastSearched: string;
  suggestedCategory?: string;
  status: 'pending' | 'in_progress' | 'answered' | 'ignored';
  assignedTo?: string;
  createdAt: string;
}

/**
 * Reporte generado
 */
export interface KBReport {
  id: string;
  name: string;
  type: 'content' | 'engagement' | 'search' | 'comprehensive';
  periodStart: string;
  periodEnd: string;
  format: 'pdf' | 'excel' | 'json';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  generatedAt?: string;
  expiresAt?: string;
  requestedBy: string;
  createdAt: string;
}

/**
 * Estadísticas en tiempo real
 */
export interface RealtimeStats {
  activeUsers: number;
  activeSearches: number;
  viewsLastHour: number;
  viewsLast24Hours: number;
  currentlyViewing: {
    contentType: 'document' | 'faq';
    contentId: string;
    title: string;
    viewerCount: number;
  }[];
  recentSearches: { query: string; timestamp: string }[];
  recentViews: { contentType: 'document' | 'faq'; title: string; timestamp: string }[];
}

// ============================================================================
// DTOs - Requests
// ============================================================================

/**
 * Crear documento
 */
export interface CreateDocumentRequest {
  title: string;
  content: string;
  excerpt?: string;
  type: DocumentType;
  visibility: DocumentVisibility;
  categoryId: string;
  tagIds?: string[];
  featuredImage?: string;
  allowedRoles?: string[];
  allowedPrograms?: string[];
}

/**
 * Actualizar documento
 */
export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  type?: DocumentType;
  visibility?: DocumentVisibility;
  categoryId?: string;
  tagIds?: string[];
  featuredImage?: string;
  allowedRoles?: string[];
  allowedPrograms?: string[];
}

/**
 * Crear FAQ
 */
export interface CreateFAQRequest {
  question: string;
  answer: string;
  categoryId: string;
  tagIds?: string[];
  sortOrder?: number;
  isFeatured?: boolean;
  relatedFAQIds?: string[];
  relatedDocumentIds?: string[];
}

/**
 * Actualizar FAQ
 */
export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
  categoryId?: string;
  tagIds?: string[];
  sortOrder?: number;
  isFeatured?: boolean;
  isPinned?: boolean;
  relatedFAQIds?: string[];
  relatedDocumentIds?: string[];
}

/**
 * Crear categoría
 */
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

/**
 * Crear tag
 */
export interface CreateTagRequest {
  name: string;
}

/**
 * Búsqueda de documentos
 */
export interface SearchDocumentsParams {
  query?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  visibility?: DocumentVisibility;
  categoryId?: string;
  tagIds?: string[];
  authorId?: string;
  searchType?: SearchType;
  sortBy?: 'relevance' | 'date' | 'views' | 'rating' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Búsqueda de FAQs
 */
export interface SearchFAQsParams {
  query?: string;
  categoryId?: string;
  tagIds?: string[];
  status?: FAQStatus;
  isFeatured?: boolean;
  searchType?: SearchType;
  sortBy?: 'relevance' | 'date' | 'views' | 'rating' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Parámetros de analytics
 */
export interface AnalyticsParams {
  periodStart?: string;
  periodEnd?: string;
  categoryId?: string;
  type?: 'document' | 'faq';
  limit?: number;
}

/**
 * Calificar contenido
 */
export interface RateContentRequest {
  rating: number;
  feedback?: string;
  isHelpful?: boolean;
}

/**
 * Generar reporte
 */
export interface GenerateReportRequest {
  name: string;
  type: 'content' | 'engagement' | 'search' | 'comprehensive';
  periodStart: string;
  periodEnd: string;
  format: 'pdf' | 'excel' | 'json';
  includeCategories?: string[];
  includeMetrics?: string[];
}

// ============================================================================
// DTOs - Responses
// ============================================================================

/**
 * Respuesta paginada de documentos
 */
export interface PaginatedDocuments {
  data: KBDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Respuesta paginada de FAQs
 */
export interface PaginatedFAQs {
  data: FAQ[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Respuesta de búsqueda
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  suggestions: SearchSuggestion[];
  didYouMean?: string;
  searchTime: number;
}

/**
 * Analytics dashboard completo
 */
export interface KBAnalyticsDashboard {
  contentStats: ContentStats;
  engagementStats: EngagementStats;
  searchStats: SearchStats;
  topContent: TopContent[];
  recentTrends: ContentTrend;
  contentGaps: ContentGap[];
  unansweredQuestions: UnansweredQuestion[];
}

// ============================================================================
// TIPOS DE FILTROS PARA UI
// ============================================================================

/**
 * Filtros de documentos
 */
export interface DocumentFilters {
  query: string;
  type: DocumentType | null;
  status: DocumentStatus | null;
  categoryId: string | null;
  tagIds: string[];
  visibility: DocumentVisibility | null;
  dateRange: { start: string; end: string } | null;
}

/**
 * Filtros de FAQs
 */
export interface FAQFilters {
  query: string;
  categoryId: string | null;
  tagIds: string[];
  status: FAQStatus | null;
  isFeatured: boolean | null;
}

/**
 * Estado inicial de filtros de documentos
 */
export const INITIAL_DOCUMENT_FILTERS: DocumentFilters = {
  query: '',
  type: null,
  status: null,
  categoryId: null,
  tagIds: [],
  visibility: null,
  dateRange: null,
};

/**
 * Estado inicial de filtros de FAQs
 */
export const INITIAL_FAQ_FILTERS: FAQFilters = {
  query: '',
  categoryId: null,
  tagIds: [],
  status: null,
  isFeatured: null,
};
