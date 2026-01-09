/**
 * Store para KbService - Knowledge Base
 * Gestión de estado con Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  KBDocument,
  KBCategory,
  KBTag,
  FAQ,
  ContentBookmark,
  SearchResult,
  ContentStats,
  EngagementStats,
  SearchStats,
  TopContent,
  ContentGap,
  UnansweredQuestion,
  KBReport,
  RealtimeStats,
  DocumentFilters,
  FAQFilters,
} from '@/types/kb.types';
import {
  INITIAL_DOCUMENT_FILTERS,
  INITIAL_FAQ_FILTERS,
} from '@/types/kb.types';

// ============================================================================
// TIPOS DEL STORE
// ============================================================================

interface SearchFilters {
  query: string;
  type: 'all' | 'document' | 'faq';
  categoryId: string | null;
  searchType: 'keyword' | 'semantic' | 'hybrid';
}

interface KBState {
  // Datos principales
  categories: KBCategory[];
  tags: KBTag[];
  documents: KBDocument[];
  faqs: FAQ[];
  bookmarks: ContentBookmark[];
  
  // Búsqueda
  searchResults: SearchResult[];
  searchSuggestions: string[];
  recentSearches: string[];
  
  // Selección actual
  selectedCategory: KBCategory | null;
  selectedDocument: KBDocument | null;
  selectedFAQ: FAQ | null;
  
  // Analytics
  contentStats: ContentStats | null;
  engagementStats: EngagementStats | null;
  searchStats: SearchStats | null;
  topContent: TopContent[];
  contentGaps: ContentGap[];
  unansweredQuestions: UnansweredQuestion[];
  realtimeStats: RealtimeStats | null;
  
  // Reportes
  reports: KBReport[];
  selectedReport: KBReport | null;
  
  // Filtros
  searchFilters: SearchFilters;
  documentFilters: DocumentFilters;
  faqFilters: FAQFilters;
  
  // Paginación
  documentsPagination: { page: number; pageSize: number; total: number };
  faqsPagination: { page: number; pageSize: number; total: number };
  searchPagination: { page: number; pageSize: number; total: number };
  
  // Estados de UI
  isLoading: boolean;
  isSearching: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Modales
  modals: {
    documentEditor: boolean;
    documentViewer: boolean;
    faqEditor: boolean;
    categoryEditor: boolean;
    reportGenerator: boolean;
    searchAdvanced: boolean;
  };
  
  // Vista actual
  currentView: 'search' | 'documents' | 'faqs' | 'categories' | 'analytics' | 'reports';
}

interface KBActions {
  // Categorías
  setCategories: (categories: KBCategory[]) => void;
  addCategory: (category: KBCategory) => void;
  updateCategory: (id: string, data: Partial<KBCategory>) => void;
  removeCategory: (id: string) => void;
  setSelectedCategory: (category: KBCategory | null) => void;
  
  // Tags
  setTags: (tags: KBTag[]) => void;
  addTag: (tag: KBTag) => void;
  removeTag: (id: string) => void;
  
  // Documentos
  setDocuments: (documents: KBDocument[]) => void;
  addDocument: (document: KBDocument) => void;
  updateDocument: (id: string, data: Partial<KBDocument>) => void;
  removeDocument: (id: string) => void;
  setSelectedDocument: (document: KBDocument | null) => void;
  setDocumentFilters: (filters: Partial<DocumentFilters>) => void;
  resetDocumentFilters: () => void;
  
  // FAQs
  setFAQs: (faqs: FAQ[]) => void;
  addFAQ: (faq: FAQ) => void;
  updateFAQ: (id: string, data: Partial<FAQ>) => void;
  removeFAQ: (id: string) => void;
  setSelectedFAQ: (faq: FAQ | null) => void;
  setFAQFilters: (filters: Partial<FAQFilters>) => void;
  resetFAQFilters: () => void;
  
  // Búsqueda
  setSearchResults: (results: SearchResult[]) => void;
  setSearchSuggestions: (suggestions: string[]) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;
  
  // Bookmarks
  setBookmarks: (bookmarks: ContentBookmark[]) => void;
  addBookmark: (bookmark: ContentBookmark) => void;
  removeBookmark: (id: string) => void;
  
  // Analytics
  setContentStats: (stats: ContentStats) => void;
  setEngagementStats: (stats: EngagementStats) => void;
  setSearchStats: (stats: SearchStats) => void;
  setTopContent: (content: TopContent[]) => void;
  setContentGaps: (gaps: ContentGap[]) => void;
  setUnansweredQuestions: (questions: UnansweredQuestion[]) => void;
  setRealtimeStats: (stats: RealtimeStats) => void;
  
  // Reportes
  setReports: (reports: KBReport[]) => void;
  addReport: (report: KBReport) => void;
  updateReport: (id: string, data: Partial<KBReport>) => void;
  removeReport: (id: string) => void;
  setSelectedReport: (report: KBReport | null) => void;
  
  // Paginación
  setDocumentsPagination: (pagination: Partial<{ page: number; pageSize: number; total: number }>) => void;
  setFAQsPagination: (pagination: Partial<{ page: number; pageSize: number; total: number }>) => void;
  setSearchPagination: (pagination: Partial<{ page: number; pageSize: number; total: number }>) => void;
  
  // Estados de UI
  setLoading: (loading: boolean) => void;
  setSearching: (searching: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  
  // Modales
  openModal: (modal: keyof KBState['modals']) => void;
  closeModal: (modal: keyof KBState['modals']) => void;
  toggleModal: (modal: keyof KBState['modals']) => void;
  closeAllModals: () => void;
  
  // Vista
  setCurrentView: (view: KBState['currentView']) => void;
  
  // Reset
  resetStore: () => void;
}

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialSearchFilters: SearchFilters = {
  query: '',
  type: 'all',
  categoryId: null,
  searchType: 'hybrid',
};

const initialModals: KBState['modals'] = {
  documentEditor: false,
  documentViewer: false,
  faqEditor: false,
  categoryEditor: false,
  reportGenerator: false,
  searchAdvanced: false,
};

const initialState: KBState = {
  // Datos principales
  categories: [],
  tags: [],
  documents: [],
  faqs: [],
  bookmarks: [],
  
  // Búsqueda
  searchResults: [],
  searchSuggestions: [],
  recentSearches: [],
  
  // Selección actual
  selectedCategory: null,
  selectedDocument: null,
  selectedFAQ: null,
  
  // Analytics
  contentStats: null,
  engagementStats: null,
  searchStats: null,
  topContent: [],
  contentGaps: [],
  unansweredQuestions: [],
  realtimeStats: null,
  
  // Reportes
  reports: [],
  selectedReport: null,
  
  // Filtros
  searchFilters: initialSearchFilters,
  documentFilters: INITIAL_DOCUMENT_FILTERS,
  faqFilters: INITIAL_FAQ_FILTERS,
  
  // Paginación
  documentsPagination: { page: 1, pageSize: 10, total: 0 },
  faqsPagination: { page: 1, pageSize: 10, total: 0 },
  searchPagination: { page: 1, pageSize: 10, total: 0 },
  
  // Estados de UI
  isLoading: false,
  isSearching: false,
  isSaving: false,
  error: null,
  
  // Modales
  modals: initialModals,
  
  // Vista actual
  currentView: 'search',
};

// ============================================================================
// STORE
// ============================================================================

export const useKBStore = create<KBState & KBActions>()(
  devtools(
    (set) => ({
      ...initialState,

      // ======================================================================
      // CATEGORÍAS
      // ======================================================================

      setCategories: (categories) => set({ categories }, false, 'setCategories'),

      addCategory: (category) =>
        set(
          (state) => ({ categories: [...state.categories, category] }),
          false,
          'addCategory'
        ),

      updateCategory: (id, data) =>
        set(
          (state) => ({
            categories: state.categories.map((c) =>
              c.id === id ? { ...c, ...data } : c
            ),
            selectedCategory:
              state.selectedCategory?.id === id
                ? { ...state.selectedCategory, ...data }
                : state.selectedCategory,
          }),
          false,
          'updateCategory'
        ),

      removeCategory: (id) =>
        set(
          (state) => ({
            categories: state.categories.filter((c) => c.id !== id),
            selectedCategory:
              state.selectedCategory?.id === id ? null : state.selectedCategory,
          }),
          false,
          'removeCategory'
        ),

      setSelectedCategory: (category) =>
        set({ selectedCategory: category }, false, 'setSelectedCategory'),

      // ======================================================================
      // TAGS
      // ======================================================================

      setTags: (tags) => set({ tags }, false, 'setTags'),

      addTag: (tag) =>
        set((state) => ({ tags: [...state.tags, tag] }), false, 'addTag'),

      removeTag: (id) =>
        set(
          (state) => ({ tags: state.tags.filter((t) => t.id !== id) }),
          false,
          'removeTag'
        ),

      // ======================================================================
      // DOCUMENTOS
      // ======================================================================

      setDocuments: (documents) => set({ documents }, false, 'setDocuments'),

      addDocument: (document) =>
        set(
          (state) => ({ documents: [...state.documents, document] }),
          false,
          'addDocument'
        ),

      updateDocument: (id, data) =>
        set(
          (state) => ({
            documents: state.documents.map((d) =>
              d.id === id ? { ...d, ...data } : d
            ),
            selectedDocument:
              state.selectedDocument?.id === id
                ? { ...state.selectedDocument, ...data }
                : state.selectedDocument,
          }),
          false,
          'updateDocument'
        ),

      removeDocument: (id) =>
        set(
          (state) => ({
            documents: state.documents.filter((d) => d.id !== id),
            selectedDocument:
              state.selectedDocument?.id === id ? null : state.selectedDocument,
          }),
          false,
          'removeDocument'
        ),

      setSelectedDocument: (document) =>
        set({ selectedDocument: document }, false, 'setSelectedDocument'),

      setDocumentFilters: (filters) =>
        set(
          (state) => ({
            documentFilters: { ...state.documentFilters, ...filters },
          }),
          false,
          'setDocumentFilters'
        ),

      resetDocumentFilters: () =>
        set({ documentFilters: INITIAL_DOCUMENT_FILTERS }, false, 'resetDocumentFilters'),

      // ======================================================================
      // FAQs
      // ======================================================================

      setFAQs: (faqs) => set({ faqs }, false, 'setFAQs'),

      addFAQ: (faq) =>
        set((state) => ({ faqs: [...state.faqs, faq] }), false, 'addFAQ'),

      updateFAQ: (id, data) =>
        set(
          (state) => ({
            faqs: state.faqs.map((f) => (f.id === id ? { ...f, ...data } : f)),
            selectedFAQ:
              state.selectedFAQ?.id === id
                ? { ...state.selectedFAQ, ...data }
                : state.selectedFAQ,
          }),
          false,
          'updateFAQ'
        ),

      removeFAQ: (id) =>
        set(
          (state) => ({
            faqs: state.faqs.filter((f) => f.id !== id),
            selectedFAQ: state.selectedFAQ?.id === id ? null : state.selectedFAQ,
          }),
          false,
          'removeFAQ'
        ),

      setSelectedFAQ: (faq) => set({ selectedFAQ: faq }, false, 'setSelectedFAQ'),

      setFAQFilters: (filters) =>
        set(
          (state) => ({ faqFilters: { ...state.faqFilters, ...filters } }),
          false,
          'setFAQFilters'
        ),

      resetFAQFilters: () =>
        set({ faqFilters: INITIAL_FAQ_FILTERS }, false, 'resetFAQFilters'),

      // ======================================================================
      // BÚSQUEDA
      // ======================================================================

      setSearchResults: (results) =>
        set({ searchResults: results }, false, 'setSearchResults'),

      setSearchSuggestions: (suggestions) =>
        set({ searchSuggestions: suggestions }, false, 'setSearchSuggestions'),

      addRecentSearch: (query) =>
        set(
          (state) => ({
            recentSearches: [
              query,
              ...state.recentSearches.filter((s) => s !== query),
            ].slice(0, 10),
          }),
          false,
          'addRecentSearch'
        ),

      clearRecentSearches: () =>
        set({ recentSearches: [] }, false, 'clearRecentSearches'),

      setSearchFilters: (filters) =>
        set(
          (state) => ({ searchFilters: { ...state.searchFilters, ...filters } }),
          false,
          'setSearchFilters'
        ),

      resetSearchFilters: () =>
        set({ searchFilters: initialSearchFilters }, false, 'resetSearchFilters'),

      // ======================================================================
      // BOOKMARKS
      // ======================================================================

      setBookmarks: (bookmarks) => set({ bookmarks }, false, 'setBookmarks'),

      addBookmark: (bookmark) =>
        set(
          (state) => ({ bookmarks: [...state.bookmarks, bookmark] }),
          false,
          'addBookmark'
        ),

      removeBookmark: (id) =>
        set(
          (state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== id) }),
          false,
          'removeBookmark'
        ),

      // ======================================================================
      // ANALYTICS
      // ======================================================================

      setContentStats: (stats) =>
        set({ contentStats: stats }, false, 'setContentStats'),

      setEngagementStats: (stats) =>
        set({ engagementStats: stats }, false, 'setEngagementStats'),

      setSearchStats: (stats) =>
        set({ searchStats: stats }, false, 'setSearchStats'),

      setTopContent: (content) =>
        set({ topContent: content }, false, 'setTopContent'),

      setContentGaps: (gaps) =>
        set({ contentGaps: gaps }, false, 'setContentGaps'),

      setUnansweredQuestions: (questions) =>
        set({ unansweredQuestions: questions }, false, 'setUnansweredQuestions'),

      setRealtimeStats: (stats) =>
        set({ realtimeStats: stats }, false, 'setRealtimeStats'),

      // ======================================================================
      // REPORTES
      // ======================================================================

      setReports: (reports) => set({ reports }, false, 'setReports'),

      addReport: (report) =>
        set(
          (state) => ({ reports: [...state.reports, report] }),
          false,
          'addReport'
        ),

      updateReport: (id, data) =>
        set(
          (state) => ({
            reports: state.reports.map((r) =>
              r.id === id ? { ...r, ...data } : r
            ),
            selectedReport:
              state.selectedReport?.id === id
                ? { ...state.selectedReport, ...data }
                : state.selectedReport,
          }),
          false,
          'updateReport'
        ),

      removeReport: (id) =>
        set(
          (state) => ({
            reports: state.reports.filter((r) => r.id !== id),
            selectedReport:
              state.selectedReport?.id === id ? null : state.selectedReport,
          }),
          false,
          'removeReport'
        ),

      setSelectedReport: (report) =>
        set({ selectedReport: report }, false, 'setSelectedReport'),

      // ======================================================================
      // PAGINACIÓN
      // ======================================================================

      setDocumentsPagination: (pagination) =>
        set(
          (state) => ({
            documentsPagination: { ...state.documentsPagination, ...pagination },
          }),
          false,
          'setDocumentsPagination'
        ),

      setFAQsPagination: (pagination) =>
        set(
          (state) => ({
            faqsPagination: { ...state.faqsPagination, ...pagination },
          }),
          false,
          'setFAQsPagination'
        ),

      setSearchPagination: (pagination) =>
        set(
          (state) => ({
            searchPagination: { ...state.searchPagination, ...pagination },
          }),
          false,
          'setSearchPagination'
        ),

      // ======================================================================
      // ESTADOS DE UI
      // ======================================================================

      setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),

      setSearching: (searching) =>
        set({ isSearching: searching }, false, 'setSearching'),

      setSaving: (saving) => set({ isSaving: saving }, false, 'setSaving'),

      setError: (error) => set({ error }, false, 'setError'),

      // ======================================================================
      // MODALES
      // ======================================================================

      openModal: (modal) =>
        set(
          (state) => ({
            modals: { ...state.modals, [modal]: true },
          }),
          false,
          'openModal'
        ),

      closeModal: (modal) =>
        set(
          (state) => ({
            modals: { ...state.modals, [modal]: false },
          }),
          false,
          'closeModal'
        ),

      toggleModal: (modal) =>
        set(
          (state) => ({
            modals: { ...state.modals, [modal]: !state.modals[modal] },
          }),
          false,
          'toggleModal'
        ),

      closeAllModals: () => set({ modals: initialModals }, false, 'closeAllModals'),

      // ======================================================================
      // VISTA
      // ======================================================================

      setCurrentView: (view) => set({ currentView: view }, false, 'setCurrentView'),

      // ======================================================================
      // RESET
      // ======================================================================

      resetStore: () => set(initialState, false, 'resetStore'),
    }),
    { name: 'kb-store' }
  )
);

// ============================================================================
// SELECTORES
// ============================================================================

/**
 * Documentos filtrados
 */
export const selectFilteredDocuments = (state: KBState): KBDocument[] => {
  const { documents, documentFilters } = state;

  return documents.filter((doc) => {
    // Filtro por query
    if (documentFilters.query) {
      const query = documentFilters.query.toLowerCase();
      const matchesTitle = doc.title.toLowerCase().includes(query);
      const matchesContent = doc.content.toLowerCase().includes(query);
      const matchesExcerpt = doc.excerpt?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesContent && !matchesExcerpt) return false;
    }

    // Filtro por tipo
    if (documentFilters.type && doc.type !== documentFilters.type) {
      return false;
    }

    // Filtro por estado
    if (documentFilters.status && doc.status !== documentFilters.status) {
      return false;
    }

    // Filtro por categoría
    if (documentFilters.categoryId && doc.categoryId !== documentFilters.categoryId) {
      return false;
    }

    // Filtro por visibilidad
    if (documentFilters.visibility && doc.visibility !== documentFilters.visibility) {
      return false;
    }

    // Filtro por tags
    if (documentFilters.tagIds.length > 0) {
      const docTagIds = doc.tags.map((t) => t.id);
      const hasMatchingTag = documentFilters.tagIds.some((id) =>
        docTagIds.includes(id)
      );
      if (!hasMatchingTag) return false;
    }

    // Filtro por rango de fechas
    if (documentFilters.dateRange) {
      const docDate = new Date(doc.createdAt);
      const start = new Date(documentFilters.dateRange.start);
      const end = new Date(documentFilters.dateRange.end);
      if (docDate < start || docDate > end) return false;
    }

    return true;
  });
};

/**
 * FAQs filtradas
 */
export const selectFilteredFAQs = (state: KBState): FAQ[] => {
  const { faqs, faqFilters } = state;

  return faqs.filter((faq) => {
    // Filtro por query
    if (faqFilters.query) {
      const query = faqFilters.query.toLowerCase();
      const matchesQuestion = faq.question.toLowerCase().includes(query);
      const matchesAnswer = faq.answer.toLowerCase().includes(query);
      if (!matchesQuestion && !matchesAnswer) return false;
    }

    // Filtro por categoría
    if (faqFilters.categoryId && faq.categoryId !== faqFilters.categoryId) {
      return false;
    }

    // Filtro por estado
    if (faqFilters.status && faq.status !== faqFilters.status) {
      return false;
    }

    // Filtro por destacados
    if (faqFilters.isFeatured !== null && faq.isFeatured !== faqFilters.isFeatured) {
      return false;
    }

    // Filtro por tags
    if (faqFilters.tagIds.length > 0) {
      const faqTagIds = faq.tags.map((t) => t.id);
      const hasMatchingTag = faqFilters.tagIds.some((id) => faqTagIds.includes(id));
      if (!hasMatchingTag) return false;
    }

    return true;
  });
};

/**
 * Documentos por categoría
 */
export const selectDocumentsByCategory = (
  state: KBState,
  categoryId: string
): KBDocument[] => {
  return state.documents.filter((doc) => doc.categoryId === categoryId);
};

/**
 * FAQs por categoría
 */
export const selectFAQsByCategory = (state: KBState, categoryId: string): FAQ[] => {
  return state.faqs.filter((faq) => faq.categoryId === categoryId);
};

/**
 * Documentos publicados
 */
export const selectPublishedDocuments = (state: KBState): KBDocument[] => {
  return state.documents.filter((doc) => doc.status === 'published');
};

/**
 * FAQs publicadas
 */
export const selectPublishedFAQs = (state: KBState): FAQ[] => {
  return state.faqs.filter((faq) => faq.status === 'published');
};

/**
 * FAQs destacadas
 */
export const selectFeaturedFAQs = (state: KBState): FAQ[] => {
  return state.faqs.filter((faq) => faq.isFeatured && faq.status === 'published');
};

/**
 * Documentos en borrador
 */
export const selectDraftDocuments = (state: KBState): KBDocument[] => {
  return state.documents.filter((doc) => doc.status === 'draft');
};

/**
 * Documentos pendientes de revisión
 */
export const selectPendingReviewDocuments = (state: KBState): KBDocument[] => {
  return state.documents.filter((doc) => doc.status === 'pending_review');
};

/**
 * Categorías con conteo
 */
export const selectCategoriesWithCounts = (state: KBState) => {
  return state.categories.map((cat) => ({
    ...cat,
    documentCount: state.documents.filter((d) => d.categoryId === cat.id).length,
    faqCount: state.faqs.filter((f) => f.categoryId === cat.id).length,
  }));
};

/**
 * Tags más usados
 */
export const selectTopTags = (state: KBState, limit = 10) => {
  const tagCounts = new Map<string, { tag: KBTag; count: number }>();

  // Contar tags en documentos
  state.documents.forEach((doc) => {
    doc.tags.forEach((tag) => {
      const existing = tagCounts.get(tag.id);
      if (existing) {
        existing.count++;
      } else {
        tagCounts.set(tag.id, { tag, count: 1 });
      }
    });
  });

  // Contar tags en FAQs
  state.faqs.forEach((faq) => {
    faq.tags.forEach((tag) => {
      const existing = tagCounts.get(tag.id);
      if (existing) {
        existing.count++;
      } else {
        tagCounts.set(tag.id, { tag, count: 1 });
      }
    });
  });

  return Array.from(tagCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((item) => ({ ...item.tag, usageCount: item.count }));
};

/**
 * Estadísticas resumidas
 */
export const selectSummaryStats = (state: KBState) => {
  const publishedDocs = state.documents.filter((d) => d.status === 'published');
  const publishedFAQs = state.faqs.filter((f) => f.status === 'published');

  return {
    totalDocuments: state.documents.length,
    publishedDocuments: publishedDocs.length,
    draftDocuments: state.documents.filter((d) => d.status === 'draft').length,
    pendingReviewDocuments: state.documents.filter((d) => d.status === 'pending_review').length,
    totalFAQs: state.faqs.length,
    publishedFAQs: publishedFAQs.length,
    totalCategories: state.categories.length,
    totalTags: state.tags.length,
    totalViews: publishedDocs.reduce((sum, d) => sum + d.viewCount, 0) +
                publishedFAQs.reduce((sum, f) => sum + f.viewCount, 0),
    averageRating:
      publishedDocs.length > 0
        ? publishedDocs.reduce((sum, d) => sum + d.rating, 0) / publishedDocs.length
        : 0,
  };
};

/**
 * Bookmarks por tipo
 */
export const selectBookmarksByType = (state: KBState, type: 'document' | 'faq') => {
  return state.bookmarks.filter((b) => b.contentType === type);
};

/**
 * Verificar si un contenido está en bookmarks
 */
export const selectIsBookmarked = (
  state: KBState,
  contentType: 'document' | 'faq',
  contentId: string
): boolean => {
  return state.bookmarks.some(
    (b) => b.contentType === contentType && b.contentId === contentId
  );
};
