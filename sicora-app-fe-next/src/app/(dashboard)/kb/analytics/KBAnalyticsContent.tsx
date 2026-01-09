'use client';

/**
 * Página de Analytics - Knowledge Base
 * Dashboard de métricas y estadísticas de contenido
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  HelpCircle,
  Users,
  Search,
  Star,
  Download,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { useKBStore } from '@/stores/kbStore';
import type {
  ContentStats,
  EngagementStats,
  SearchStats,
  TopContent,
  ContentGap,
  UnansweredQuestion,
  RealtimeStats,
} from '@/types/kb.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoContentStats: ContentStats = {
  totalDocuments: 45,
  totalFAQs: 78,
  totalCategories: 6,
  publishedDocuments: 38,
  draftDocuments: 5,
  pendingReviewDocuments: 2,
  totalViews: 45678,
  totalRatings: 2345,
  averageRating: 4.6,
  documentsByType: [
    { type: 'guide', count: 15 },
    { type: 'article', count: 12 },
    { type: 'tutorial', count: 8 },
    { type: 'policy', count: 6 },
    { type: 'procedure', count: 4 },
  ],
  documentsByCategory: [
    { categoryId: 'cat-1', categoryName: 'Académico', count: 18 },
    { categoryId: 'cat-2', categoryName: 'Administrativo', count: 15 },
    { categoryId: 'cat-3', categoryName: 'Técnico', count: 8 },
    { categoryId: 'cat-4', categoryName: 'Políticas', count: 4 },
  ],
  documentsByStatus: [
    { status: 'published', count: 38 },
    { status: 'draft', count: 5 },
    { status: 'pending_review', count: 2 },
  ],
};

const demoEngagementStats: EngagementStats = {
  periodStart: '2025-01-01',
  periodEnd: '2025-01-31',
  totalViews: 45678,
  uniqueVisitors: 12456,
  averageSessionDuration: 245,
  bounceRate: 32.5,
  searchCount: 8934,
  ratingCount: 567,
  bookmarkCount: 234,
  shareCount: 89,
  viewsByDay: [
    { date: '2025-01-25', views: 1234, uniqueVisitors: 456 },
    { date: '2025-01-26', views: 1456, uniqueVisitors: 523 },
    { date: '2025-01-27', views: 1678, uniqueVisitors: 612 },
    { date: '2025-01-28', views: 1234, uniqueVisitors: 445 },
    { date: '2025-01-29', views: 1890, uniqueVisitors: 678 },
    { date: '2025-01-30', views: 2100, uniqueVisitors: 756 },
    { date: '2025-01-31', views: 1950, uniqueVisitors: 698 },
  ],
  topReferers: [
    { source: 'Búsqueda interna', count: 4567 },
    { source: 'Google', count: 2345 },
    { source: 'Dashboard', count: 1234 },
    { source: 'Directo', count: 890 },
  ],
};

const demoSearchStats: SearchStats = {
  totalSearches: 8934,
  uniqueSearches: 3456,
  searchesWithResults: 7845,
  searchesWithoutResults: 1089,
  averageResultsPerSearch: 8.5,
  clickThroughRate: 67.8,
  topQueries: [
    { query: 'matrícula', count: 456, avgResults: 12 },
    { query: 'horario', count: 389, avgResults: 8 },
    { query: 'certificado', count: 345, avgResults: 6 },
    { query: 'asistencia', count: 312, avgResults: 15 },
    { query: 'contraseña', count: 289, avgResults: 4 },
  ],
  zeroResultQueries: [
    { query: 'becas internacionales', count: 45 },
    { query: 'intercambio estudiantil', count: 38 },
    { query: 'doble titulación', count: 32 },
    { query: 'prácticas empresariales', count: 28 },
  ],
  searchesByDay: [
    { date: '2025-01-25', count: 234 },
    { date: '2025-01-26', count: 289 },
    { date: '2025-01-27', count: 345 },
    { date: '2025-01-28', count: 278 },
    { date: '2025-01-29', count: 412 },
    { date: '2025-01-30', count: 467 },
    { date: '2025-01-31', count: 398 },
  ],
};

const demoTopContent: TopContent[] = [
  { id: 'doc-1', type: 'document', title: 'Guía de Matrícula para Nuevos Aprendices', slug: 'guia-matricula', viewCount: 1250, uniqueViewCount: 980, rating: 4.8, trend: 'up', trendPercentage: 15 },
  { id: 'faq-1', type: 'faq', title: '¿Cómo justifico una inasistencia?', slug: 'justificar-inasistencia', viewCount: 5420, uniqueViewCount: 4200, rating: 4.9, trend: 'up', trendPercentage: 8 },
  { id: 'doc-2', type: 'document', title: 'Manual del Sistema de Asistencia', slug: 'manual-asistencia', viewCount: 890, uniqueViewCount: 720, rating: 4.5, trend: 'stable', trendPercentage: 2 },
  { id: 'faq-2', type: 'faq', title: '¿Dónde consulto mi horario?', slug: 'consultar-horario', viewCount: 4280, uniqueViewCount: 3500, rating: 4.8, trend: 'down', trendPercentage: -5 },
  { id: 'doc-3', type: 'document', title: 'Política de Evaluación', slug: 'politica-evaluacion', viewCount: 567, uniqueViewCount: 450, rating: 4.3, trend: 'up', trendPercentage: 22 },
];

const demoContentGaps: ContentGap[] = [
  { id: 'gap-1', query: 'becas internacionales', searchCount: 145, noResultsCount: 45, suggestedCategory: 'Académico', suggestedTags: ['Becas', 'Internacional'], priority: 'high', createdAt: '2025-01-20' },
  { id: 'gap-2', query: 'intercambio estudiantil', searchCount: 98, noResultsCount: 38, suggestedCategory: 'Académico', suggestedTags: ['Intercambio', 'Movilidad'], priority: 'high', createdAt: '2025-01-18' },
  { id: 'gap-3', query: 'doble titulación', searchCount: 76, noResultsCount: 32, suggestedCategory: 'Académico', priority: 'medium', createdAt: '2025-01-15' },
  { id: 'gap-4', query: 'prácticas empresariales', searchCount: 65, noResultsCount: 28, suggestedCategory: 'Administrativo', priority: 'medium', createdAt: '2025-01-12' },
];

const demoUnansweredQuestions: UnansweredQuestion[] = [
  { id: 'uq-1', question: '¿Cómo aplico a una beca internacional?', searchCount: 45, lastSearched: '2025-01-31', suggestedCategory: 'Académico', status: 'pending', createdAt: '2025-01-20' },
  { id: 'uq-2', question: '¿Cuáles son los requisitos para intercambio?', searchCount: 38, lastSearched: '2025-01-30', suggestedCategory: 'Académico', status: 'in_progress', assignedTo: 'María García', createdAt: '2025-01-18' },
  { id: 'uq-3', question: '¿Hay convenios de doble titulación?', searchCount: 32, lastSearched: '2025-01-29', status: 'pending', createdAt: '2025-01-15' },
];

const demoRealtimeStats: RealtimeStats = {
  activeUsers: 234,
  activeSearches: 12,
  viewsLastHour: 456,
  viewsLast24Hours: 3456,
  currentlyViewing: [
    { contentType: 'document', contentId: 'doc-1', title: 'Guía de Matrícula', viewerCount: 15 },
    { contentType: 'faq', contentId: 'faq-1', title: '¿Cómo justifico una inasistencia?', viewerCount: 8 },
    { contentType: 'document', contentId: 'doc-2', title: 'Manual de Asistencia', viewerCount: 5 },
  ],
  recentSearches: [
    { query: 'matrícula 2025', timestamp: '2025-01-31T10:30:00Z' },
    { query: 'horario semestre', timestamp: '2025-01-31T10:29:00Z' },
    { query: 'certificado notas', timestamp: '2025-01-31T10:28:00Z' },
  ],
  recentViews: [
    { contentType: 'document', title: 'Calendario Académico', timestamp: '2025-01-31T10:30:00Z' },
    { contentType: 'faq', title: '¿Cómo recupero contraseña?', timestamp: '2025-01-31T10:29:00Z' },
  ],
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}

function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <p className="text-xs text-gray-400 mt-1">{trend.label}</p>
        )}
      </div>
    </div>
  );
}

interface MiniChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

function MiniBarChart({ data, height = 100 }: MiniChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
            style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: 4 }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

interface TopContentItemProps {
  content: TopContent;
  rank: number;
}

function TopContentItem({ content, rank }: TopContentItemProps) {
  const trendIcon = content.trend === 'up' 
    ? <TrendingUp className="w-4 h-4 text-green-500" />
    : content.trend === 'down'
    ? <TrendingDown className="w-4 h-4 text-red-500" />
    : <Minus className="w-4 h-4 text-gray-400" />;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-lg font-bold text-gray-300 w-6 text-center">{rank}</span>
      <div className={`p-2 rounded-lg ${content.type === 'document' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
        {content.type === 'document' ? <FileText className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{content.title}</h4>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {content.viewCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            {content.rating.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {trendIcon}
        <span className={`text-sm ${content.trend === 'up' ? 'text-green-600' : content.trend === 'down' ? 'text-red-600' : 'text-gray-400'}`}>
          {content.trendPercentage > 0 ? '+' : ''}{content.trendPercentage}%
        </span>
      </div>
    </div>
  );
}

interface ContentGapItemProps {
  gap: ContentGap;
}

function ContentGapItem({ gap }: ContentGapItemProps) {
  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${gap.priority === 'high' ? 'text-red-500' : gap.priority === 'medium' ? 'text-amber-500' : 'text-green-500'}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">&quot;{gap.query}&quot;</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
          <span>{gap.searchCount} búsquedas</span>
          <span>•</span>
          <span>{gap.noResultsCount} sin resultados</span>
        </div>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColors[gap.priority]}`}>
        {gap.priority === 'high' ? 'Alta' : gap.priority === 'medium' ? 'Media' : 'Baja'}
      </span>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function KBAnalyticsContent() {
  // Estado
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Store
  const {
    contentStats,
    engagementStats,
    searchStats,
    topContent,
    contentGaps,
    unansweredQuestions,
    realtimeStats,
    setContentStats,
    setEngagementStats,
    setSearchStats,
    setTopContent,
    setContentGaps,
    setUnansweredQuestions,
    setRealtimeStats,
  } = useKBStore();

  // Usar datos del store o demo
  const stats = contentStats || demoContentStats;
  const engagement = engagementStats || demoEngagementStats;
  const search = searchStats || demoSearchStats;
  const top = topContent.length > 0 ? topContent : demoTopContent;
  const gaps = contentGaps.length > 0 ? contentGaps : demoContentGaps;
  const unanswered = unansweredQuestions.length > 0 ? unansweredQuestions : demoUnansweredQuestions;
  const realtime = realtimeStats || demoRealtimeStats;

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Cargar datos al montar
  useEffect(() => {
    setContentStats(demoContentStats);
    setEngagementStats(demoEngagementStats);
    setSearchStats(demoSearchStats);
    setTopContent(demoTopContent);
    setContentGaps(demoContentGaps);
    setUnansweredQuestions(demoUnansweredQuestions);
    setRealtimeStats(demoRealtimeStats);
  }, [setContentStats, setEngagementStats, setSearchStats, setTopContent, setContentGaps, setUnansweredQuestions, setRealtimeStats]);

  // Preparar datos para gráfico
  const viewsChartData = engagement.viewsByDay.map((d) => ({
    label: new Date(d.date).toLocaleDateString('es-CO', { weekday: 'short' }),
    value: d.views,
  }));

  const searchChartData = search.searchesByDay.map((d) => ({
    label: new Date(d.date).toLocaleDateString('es-CO', { weekday: 'short' }),
    value: d.count,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/kb"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a Base de Conocimiento
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-blue-600" />
                Analytics de Contenido
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Selector de período */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      period === p
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {p === '7d' ? '7 días' : p === '30d' ? '30 días' : '90 días'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </button>

              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* KPIs principales */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total de Vistas"
            value={engagement.totalViews}
            icon={<Eye className="w-5 h-5" />}
            trend={{ value: 12, label: 'vs. período anterior' }}
            color="blue"
          />
          <StatCard
            title="Visitantes Únicos"
            value={engagement.uniqueVisitors}
            icon={<Users className="w-5 h-5" />}
            trend={{ value: 8, label: 'vs. período anterior' }}
            color="green"
          />
          <StatCard
            title="Búsquedas"
            value={search.totalSearches}
            icon={<Search className="w-5 h-5" />}
            trend={{ value: -3, label: 'vs. período anterior' }}
            color="purple"
          />
          <StatCard
            title="Rating Promedio"
            value={stats.averageRating.toFixed(1)}
            icon={<Star className="w-5 h-5" />}
            trend={{ value: 2, label: 'vs. período anterior' }}
            color="amber"
          />
        </div>

        {/* Gráficos y estadísticas */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Vistas por día */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">Vistas por Día</h2>
              <span className="text-sm text-gray-500">Últimos 7 días</span>
            </div>
            <MiniBarChart data={viewsChartData} height={150} />
          </div>

          {/* Búsquedas por día */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">Búsquedas por Día</h2>
              <span className="text-sm text-gray-500">Últimos 7 días</span>
            </div>
            <MiniBarChart data={searchChartData} height={150} />
          </div>
        </div>

        {/* Estadísticas detalladas */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Contenido */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Contenido
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Documentos</span>
                <span className="font-semibold">{stats.totalDocuments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">FAQs</span>
                <span className="font-semibold">{stats.totalFAQs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Publicados</span>
                <span className="font-semibold text-green-600">{stats.publishedDocuments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">En revisión</span>
                <span className="font-semibold text-amber-600">{stats.pendingReviewDocuments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Borradores</span>
                <span className="font-semibold text-gray-500">{stats.draftDocuments}</span>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Engagement
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tiempo promedio</span>
                <span className="font-semibold">{Math.floor(engagement.averageSessionDuration / 60)}m {engagement.averageSessionDuration % 60}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tasa de rebote</span>
                <span className="font-semibold">{engagement.bounceRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valoraciones</span>
                <span className="font-semibold">{engagement.ratingCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Guardados</span>
                <span className="font-semibold">{engagement.bookmarkCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Compartidos</span>
                <span className="font-semibold">{engagement.shareCount}</span>
              </div>
            </div>
          </div>

          {/* Búsquedas */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              Búsquedas
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{search.totalSearches.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Únicas</span>
                <span className="font-semibold">{search.uniqueSearches.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Con resultados</span>
                <span className="font-semibold text-green-600">{search.searchesWithResults.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sin resultados</span>
                <span className="font-semibold text-red-600">{search.searchesWithoutResults.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">CTR</span>
                <span className="font-semibold">{search.clickThroughRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido más visto y términos de búsqueda */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Top contenido */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Contenido Más Visto
              </h2>
              <Link href="/kb" className="text-sm text-blue-600 hover:text-blue-800">
                Ver todo
              </Link>
            </div>
            <div>
              {top.slice(0, 5).map((content, index) => (
                <TopContentItem key={content.id} content={content} rank={index + 1} />
              ))}
            </div>
          </div>

          {/* Top búsquedas */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                Términos Más Buscados
              </h2>
            </div>
            <div className="space-y-3">
              {search.topQueries.map((query, index) => (
                <div key={query.query} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-300 w-6 text-center">{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{query.query}</p>
                    <p className="text-sm text-gray-500">{query.count} búsquedas • ~{query.avgResults} resultados</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brechas de contenido y preguntas sin respuesta */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Brechas de contenido */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-600" />
                Brechas de Contenido
              </h2>
              <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {gaps.filter((g) => g.priority === 'high').length} alta prioridad
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Términos buscados frecuentemente que no tienen contenido asociado
            </p>
            <div>
              {gaps.slice(0, 4).map((gap) => (
                <ContentGapItem key={gap.id} gap={gap} />
              ))}
            </div>
          </div>

          {/* Preguntas sin respuesta */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                Sugerencias de Contenido
              </h2>
              <span className="text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {unanswered.filter((q) => q.status === 'pending').length} pendientes
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Preguntas identificadas que podrían convertirse en FAQs
            </p>
            <div className="space-y-3">
              {unanswered.map((question) => (
                <div key={question.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                  <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{question.question}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{question.searchCount} búsquedas</span>
                      {question.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Asignado a {question.assignedTo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    question.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                    question.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {question.status === 'pending' ? 'Pendiente' :
                     question.status === 'in_progress' ? 'En progreso' : 'Respondida'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tiempo real */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              En Tiempo Real
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{realtime.activeUsers}</p>
              <p className="text-sm text-gray-500">Usuarios activos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{realtime.viewsLastHour}</p>
              <p className="text-sm text-gray-500">Vistas última hora</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{realtime.activeSearches}</p>
              <p className="text-sm text-gray-500">Búsquedas activas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">{realtime.viewsLast24Hours.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Vistas últimas 24h</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
            {/* Contenido siendo visto ahora */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Viendo ahora</h3>
              <div className="space-y-2">
                {realtime.currentlyViewing.map((item) => (
                  <div key={item.contentId} className="flex items-center gap-3 text-sm">
                    <span className={`p-1 rounded ${item.contentType === 'document' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {item.contentType === 'document' ? <FileText className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                    </span>
                    <span className="flex-1 truncate text-gray-700">{item.title}</span>
                    <span className="text-gray-500">{item.viewerCount} usuarios</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Búsquedas recientes */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Búsquedas recientes</h3>
              <div className="space-y-2">
                {realtime.recentSearches.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <Search className="w-3 h-3 text-gray-400" />
                    <span className="flex-1 text-gray-700">{item.query}</span>
                    <span className="text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
