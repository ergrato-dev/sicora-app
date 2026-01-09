'use client';

/**
 * Página de Búsqueda - Knowledge Base
 * Búsqueda unificada de documentos y FAQs con filtros avanzados
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  FileText,
  HelpCircle,
  Filter,
  Clock,
  Star,
  Eye,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Tag,
  FolderOpen,
  Sparkles,
  History,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useKBStore } from '@/stores/kbStore';
import type {
  SearchResult,
  KBCategory,
  KBTag,
  FAQ,
  TopContent,
} from '@/types/kb.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoCategories: KBCategory[] = [
  {
    id: 'cat-1',
    name: 'Académico',
    slug: 'academico',
    description: 'Información académica y de formación',
    icon: 'GraduationCap',
    color: 'blue',
    sortOrder: 1,
    documentCount: 15,
    faqCount: 8,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Administrativo',
    slug: 'administrativo',
    description: 'Procesos y trámites administrativos',
    icon: 'Building',
    color: 'purple',
    sortOrder: 2,
    documentCount: 12,
    faqCount: 15,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Técnico',
    slug: 'tecnico',
    description: 'Soporte técnico y sistemas',
    icon: 'Settings',
    color: 'slate',
    sortOrder: 3,
    documentCount: 8,
    faqCount: 20,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Políticas',
    slug: 'politicas',
    description: 'Normativas y políticas institucionales',
    icon: 'Shield',
    color: 'red',
    sortOrder: 4,
    documentCount: 6,
    faqCount: 5,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const demoTags: KBTag[] = [
  { id: 'tag-1', name: 'Matrícula', slug: 'matricula', usageCount: 25, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tag-2', name: 'Certificados', slug: 'certificados', usageCount: 18, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tag-3', name: 'Asistencia', slug: 'asistencia', usageCount: 22, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tag-4', name: 'Evaluaciones', slug: 'evaluaciones', usageCount: 15, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tag-5', name: 'Plataforma', slug: 'plataforma', usageCount: 30, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'tag-6', name: 'Contraseña', slug: 'contrasena', usageCount: 20, createdAt: '2025-01-01T00:00:00Z' },
];

const demoSearchResults: SearchResult[] = [
  {
    id: 'doc-1',
    type: 'document',
    title: 'Guía de Matrícula para Nuevos Aprendices',
    excerpt: 'Este documento describe el proceso completo de matrícula para nuevos aprendices, incluyendo los requisitos, documentación necesaria y plazos importantes...',
    slug: 'guia-matricula-nuevos-aprendices',
    categoryName: 'Académico',
    tags: ['Matrícula', 'Nuevos Aprendices'],
    score: 0.95,
    highlights: {
      title: 'Guía de <mark>Matrícula</mark> para Nuevos Aprendices',
      content: 'proceso completo de <mark>matrícula</mark> para nuevos aprendices...',
    },
    viewCount: 1250,
    rating: 4.8,
    publishedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'faq-1',
    type: 'faq',
    title: '¿Cómo recupero mi contraseña de SICORA?',
    excerpt: 'Para recuperar tu contraseña, accede a la página de inicio de sesión y haz clic en "¿Olvidaste tu contraseña?". Recibirás un correo con instrucciones...',
    slug: 'como-recupero-contrasena-sicora',
    categoryName: 'Técnico',
    tags: ['Contraseña', 'Plataforma'],
    score: 0.92,
    viewCount: 3420,
    rating: 4.9,
    publishedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'doc-2',
    type: 'document',
    title: 'Manual de Usuario - Sistema de Asistencia',
    excerpt: 'Manual completo del sistema de registro de asistencia para instructores y coordinadores. Incluye guías paso a paso para el registro y la generación de reportes...',
    slug: 'manual-sistema-asistencia',
    categoryName: 'Técnico',
    tags: ['Asistencia', 'Plataforma'],
    score: 0.88,
    viewCount: 890,
    rating: 4.5,
    publishedAt: '2025-01-12T00:00:00Z',
  },
  {
    id: 'faq-2',
    type: 'faq',
    title: '¿Cuáles son los requisitos para solicitar un certificado?',
    excerpt: 'Para solicitar un certificado de estudios necesitas: documento de identidad, estar matriculado activamente, y no tener deudas pendientes con la institución...',
    slug: 'requisitos-solicitar-certificado',
    categoryName: 'Administrativo',
    tags: ['Certificados', 'Trámites'],
    score: 0.85,
    viewCount: 2150,
    rating: 4.7,
    publishedAt: '2025-01-08T00:00:00Z',
  },
  {
    id: 'doc-3',
    type: 'document',
    title: 'Política de Evaluación de Aprendices',
    excerpt: 'Este documento establece los lineamientos y criterios para la evaluación de aprendices en todos los programas de formación. Define los tipos de evaluación...',
    slug: 'politica-evaluacion-aprendices',
    categoryName: 'Políticas',
    tags: ['Evaluaciones', 'Normativa'],
    score: 0.82,
    viewCount: 567,
    rating: 4.3,
    publishedAt: '2025-01-05T00:00:00Z',
  },
];

const demoPopularFAQs: FAQ[] = [
  {
    id: 'faq-pop-1',
    question: '¿Cómo justifico una inasistencia?',
    answer: 'Puedes justificar una inasistencia desde el módulo de Justificaciones...',
    slug: 'como-justifico-inasistencia',
    categoryId: 'cat-2',
    tags: [{ id: 'tag-3', name: 'Asistencia', slug: 'asistencia', usageCount: 22, createdAt: '2025-01-01T00:00:00Z' }],
    status: 'published',
    viewCount: 5420,
    helpfulCount: 4800,
    notHelpfulCount: 120,
    rating: 4.9,
    author: { id: 'user-1', name: 'Admin Sistema', email: 'admin@sicora.edu', role: 'admin' },
    sortOrder: 1,
    isFeatured: true,
    isPinned: true,
    publishedAt: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'faq-pop-2',
    question: '¿Dónde consulto mi horario de clases?',
    answer: 'Tu horario está disponible en el módulo de Horarios...',
    slug: 'donde-consulto-horario-clases',
    categoryId: 'cat-1',
    tags: [{ id: 'tag-7', name: 'Horarios', slug: 'horarios', usageCount: 18, createdAt: '2025-01-01T00:00:00Z' }],
    status: 'published',
    viewCount: 4280,
    helpfulCount: 4000,
    notHelpfulCount: 80,
    rating: 4.8,
    author: { id: 'user-1', name: 'Admin Sistema', email: 'admin@sicora.edu', role: 'admin' },
    sortOrder: 2,
    isFeatured: true,
    isPinned: false,
    publishedAt: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'faq-pop-3',
    question: '¿Cómo descargo mi certificado de estudios?',
    answer: 'Los certificados se descargan desde Trámites > Certificados...',
    slug: 'como-descargo-certificado-estudios',
    categoryId: 'cat-2',
    tags: [{ id: 'tag-2', name: 'Certificados', slug: 'certificados', usageCount: 18, createdAt: '2025-01-01T00:00:00Z' }],
    status: 'published',
    viewCount: 3890,
    helpfulCount: 3600,
    notHelpfulCount: 90,
    rating: 4.7,
    author: { id: 'user-1', name: 'Admin Sistema', email: 'admin@sicora.edu', role: 'admin' },
    sortOrder: 3,
    isFeatured: true,
    isPinned: false,
    publishedAt: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const demoTopContent: TopContent[] = [
  { id: 'doc-1', type: 'document', title: 'Guía de Matrícula', slug: 'guia-matricula', viewCount: 1250, uniqueViewCount: 980, rating: 4.8, trend: 'up', trendPercentage: 15 },
  { id: 'doc-2', type: 'document', title: 'Manual de Asistencia', slug: 'manual-asistencia', viewCount: 890, uniqueViewCount: 720, rating: 4.5, trend: 'stable', trendPercentage: 2 },
  { id: 'doc-3', type: 'document', title: 'Política de Evaluación', slug: 'politica-evaluacion', viewCount: 567, uniqueViewCount: 450, rating: 4.3, trend: 'down', trendPercentage: -5 },
];

const demoRecentSearches = [
  'matrícula nuevo aprendiz',
  'recuperar contraseña',
  'certificado de estudios',
  'justificar falta',
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  suggestions: string[];
  showSuggestions: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

function SearchInput({
  value,
  onChange,
  onSearch,
  isSearching,
  suggestions,
  showSuggestions,
  onSuggestionClick,
  onFocus,
  onBlur,
}: SearchInputProps) {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Buscar documentos, guías, FAQs..."
          className="w-full pl-12 pr-32 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={onSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Buscar
          </button>
        </div>
      </div>

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onMouseDown={() => onSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryCardProps {
  category: KBCategory;
  onClick: () => void;
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 ${colorClasses[category.color || 'gray']} hover:shadow-md transition-all text-left`}
    >
      <div className="flex items-start justify-between mb-2">
        <FolderOpen className="w-6 h-6" />
        <span className="text-xs font-medium bg-white/50 px-2 py-0.5 rounded-full">
          {category.documentCount + category.faqCount} items
        </span>
      </div>
      <h3 className="font-semibold mb-1">{category.name}</h3>
      <p className="text-sm opacity-75">{category.description}</p>
    </button>
  );
}

interface SearchResultCardProps {
  result: SearchResult;
  onBookmark: () => void;
  isBookmarked: boolean;
}

function SearchResultCard({ result, onBookmark, isBookmarked }: SearchResultCardProps) {
  const isDocument = result.type === 'document';
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${isDocument ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
          {isDocument ? <FileText className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDocument ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {isDocument ? 'Documento' : 'FAQ'}
              </span>
              <span className="text-xs text-gray-500 ml-2">{result.categoryName}</span>
            </div>
            <button
              onClick={onBookmark}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title={isBookmarked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-blue-600" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          
          <h3 className="font-semibold text-gray-900 mt-2 hover:text-blue-600">
            <a href={`/kb/${isDocument ? 'documento' : 'faq'}/${result.id}`}>
              {result.highlights?.title ? (
                <span dangerouslySetInnerHTML={{ __html: result.highlights.title }} />
              ) : (
                result.title
              )}
            </a>
          </h3>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {result.highlights?.content ? (
              <span dangerouslySetInnerHTML={{ __html: result.highlights.content }} />
            ) : (
              result.excerpt
            )}
          </p>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {result.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500" />
              {result.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(result.publishedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          
          {result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {result.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PopularFAQCardProps {
  faq: FAQ;
}

function PopularFAQCard({ faq }: PopularFAQCardProps) {
  return (
    <a
      href={`/kb/faq/${faq.id}`}
      className="block p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-green-300 transition-all"
    >
      <div className="flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 line-clamp-2">{faq.question}</h4>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {faq.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              {faq.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </a>
  );
}

interface TopContentCardProps {
  content: TopContent;
}

function TopContentCard({ content }: TopContentCardProps) {
  const trendColor = content.trend === 'up' 
    ? 'text-green-600 bg-green-50' 
    : content.trend === 'down' 
    ? 'text-red-600 bg-red-50' 
    : 'text-gray-600 bg-gray-50';

  return (
    <a
      href={`/kb/${content.type === 'document' ? 'documento' : 'faq'}/${content.id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className={`p-2 rounded-lg ${content.type === 'document' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
        {content.type === 'document' ? <FileText className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{content.title}</h4>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Eye className="w-3.5 h-3.5" />
          {content.viewCount.toLocaleString()}
        </div>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${trendColor}`}>
        {content.trend === 'up' && <TrendingUp className="w-3 h-3" />}
        {content.trendPercentage > 0 ? '+' : ''}{content.trendPercentage}%
      </span>
    </a>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function KBSearchContent() {
  // Estado local
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'document' | 'faq'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [_showFilters, _setShowFilters] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  // Store
  const {
    searchResults,
    searchSuggestions,
    recentSearches,
    isSearching,
    setSearchResults,
    setSearchSuggestions,
    addRecentSearch,
    setSearching,
  } = useKBStore();

  // Datos de demo
  const categories = demoCategories;
  const tags = demoTags;
  const popularFAQs = demoPopularFAQs;
  const topContent = demoTopContent;

  // Usar resultados del store o demo
  const results = hasSearched ? (searchResults.length > 0 ? searchResults : demoSearchResults) : [];
  const suggestions = searchSuggestions.length > 0 ? searchSuggestions : demoRecentSearches;

  // Handlers
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setHasSearched(true);
    addRecentSearch(searchQuery.trim());
    setShowSuggestions(false);
    
    // Simular búsqueda
    setTimeout(() => {
      setSearchResults(demoSearchResults.filter((r) => {
        const matchesQuery = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || r.type === selectedType;
        return matchesQuery && matchesType;
      }));
      setSearching(false);
    }, 500);
  }, [searchQuery, selectedType, setSearching, addRecentSearch, setSearchResults]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setHasSearched(true);
    setSearchResults(demoSearchResults.filter((r) => 
      r.categoryName === categories.find((c) => c.id === categoryId)?.name
    ));
  };

  const handleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedCategory(null);
    setSearchQuery('');
    setHasSearched(false);
    setSearchResults([]);
  };

  // Actualizar sugerencias mientras escribe
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchSuggestions(
        demoRecentSearches.filter((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, setSearchSuggestions]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con búsqueda */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Base de Conocimiento</h1>
            <p className="text-blue-100">
              Encuentra respuestas, guías y documentación de SICORA
            </p>
          </div>
          
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            isSearching={isSearching}
            suggestions={suggestions}
            showSuggestions={showSuggestions && searchQuery.length >= 2}
            onSuggestionClick={handleSuggestionClick}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />

          {/* Búsquedas recientes */}
          {!hasSearched && recentSearches.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <History className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm">Recientes:</span>
              {recentSearches.slice(0, 4).map((search) => (
                <button
                  key={search}
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch();
                  }}
                  className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {hasSearched ? (
          /* Vista de resultados */
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar de filtros */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </h3>
                  {(selectedType !== 'all' || selectedCategory) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Tipo de contenido */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tipo</h4>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={selectedType === 'all'}
                        onChange={() => setSelectedType('all')}
                        className="text-blue-600"
                      />
                      <span className="text-sm">Todos</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={selectedType === 'document'}
                        onChange={() => setSelectedType('document')}
                        className="text-blue-600"
                      />
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Documentos</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={selectedType === 'faq'}
                        onChange={() => setSelectedType('faq')}
                        className="text-blue-600"
                      />
                      <HelpCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">FAQs</span>
                    </label>
                  </div>
                </div>

                {/* Categorías */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Categoría</h4>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.id}
                          onChange={() => setSelectedCategory(cat.id)}
                          className="text-blue-600"
                        />
                        <span className="text-sm">{cat.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {cat.documentCount + cat.faqCount}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags populares */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags populares</h4>
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 6).map((tag) => (
                      <button
                        key={tag.id}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-full transition-colors"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Resultados */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  {isSearching ? 'Buscando...' : `${results.length} resultados`}
                  {searchQuery && <span className="text-gray-500 font-normal"> para &quot;{searchQuery}&quot;</span>}
                </h2>
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>

              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results
                    .filter((r) => selectedType === 'all' || r.type === selectedType)
                    .filter((r) => !selectedCategory || r.categoryName === categories.find((c) => c.id === selectedCategory)?.name)
                    .map((result) => (
                      <SearchResultCard
                        key={result.id}
                        result={result}
                        onBookmark={() => handleBookmark(result.id)}
                        isBookmarked={bookmarkedIds.has(result.id)}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-500 mb-4">
                    Intenta con otros términos de búsqueda o ajusta los filtros
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Limpiar filtros y volver al inicio
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Vista inicial */
          <div className="space-y-8">
            {/* Categorías */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                Explorar por Categoría
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategoryClick(category.id)}
                  />
                ))}
              </div>
            </section>

            {/* FAQs Populares y Contenido Top */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* FAQs Populares */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-green-600" />
                  Preguntas Frecuentes
                </h2>
                <div className="space-y-3">
                  {popularFAQs.map((faq) => (
                    <PopularFAQCard key={faq.id} faq={faq} />
                  ))}
                </div>
                <a
                  href="/kb/faqs"
                  className="flex items-center gap-2 justify-center mt-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todas las FAQs
                  <ArrowRight className="w-4 h-4" />
                </a>
              </section>

              {/* Contenido Popular */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  Más Consultado
                </h2>
                <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {topContent.map((content) => (
                    <TopContentCard key={content.id} content={content} />
                  ))}
                </div>
                <a
                  href="/kb/analytics"
                  className="flex items-center gap-2 justify-center mt-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver analytics completos
                  <ArrowRight className="w-4 h-4" />
                </a>
              </section>
            </div>

            {/* Tags populares */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                Tags Populares
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setSearchQuery(tag.name);
                      handleSearch();
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors flex items-center gap-2"
                  >
                    <span>{tag.name}</span>
                    <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded-full">
                      {tag.usageCount}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Accesos rápidos */}
            <section className="grid sm:grid-cols-3 gap-4">
              <a
                href="/kb/documentos"
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Documentos</h3>
                  <p className="text-sm text-gray-500">Guías y manuales</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </a>

              <a
                href="/kb/faqs"
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-green-300 transition-all"
              >
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">FAQs</h3>
                  <p className="text-sm text-gray-500">Preguntas frecuentes</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </a>

              <a
                href="/kb/bookmarks"
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-amber-300 transition-all"
              >
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mis Favoritos</h3>
                  <p className="text-sm text-gray-500">Contenido guardado</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </a>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
