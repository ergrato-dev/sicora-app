'use client';

/**
 * Página de Detalle de Documento - Knowledge Base
 * Muestra documento completo con ratings, comentarios y relacionados
 */

import { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Printer,
  Clock,
  Eye,
  Star,
  Calendar,
  Tag,
  FolderOpen,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  FileText,
  HelpCircle,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useKBStore } from '@/stores/kbStore';
import type {
  KBDocument,
  SearchResult,
} from '@/types/kb.types';
import {
  DOCUMENT_STATUS_CONFIG,
  DOCUMENT_TYPE_CONFIG,
} from '@/types/kb.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoDocument: KBDocument = {
  id: 'doc-1',
  title: 'Guía de Matrícula para Nuevos Aprendices',
  slug: 'guia-matricula-nuevos-aprendices',
  content: `
# Guía de Matrícula para Nuevos Aprendices

## Introducción

Este documento describe el proceso completo de matrícula para nuevos aprendices en los programas de formación de OneVision Sede Formación. Sigue cada paso cuidadosamente para completar tu matrícula exitosamente.

## Requisitos Previos

Antes de iniciar el proceso de matrícula, asegúrate de tener los siguientes documentos:

1. **Documento de identidad** - Original y fotocopia
2. **Certificado de estudios** - Del último grado aprobado
3. **Fotografías** - 2 fotos tamaño 3x4, fondo blanco
4. **Afiliación a salud** - EPS o SISBEN
5. **Certificado de antecedentes** - No mayor a 3 meses

## Proceso de Matrícula

### Paso 1: Registro en Línea

1. Ingresa al portal de matrículas: [portal.sicora.edu.co](https://portal.sicora.edu.co)
2. Haz clic en "Nuevo Registro"
3. Completa el formulario con tus datos personales
4. Verifica tu correo electrónico

### Paso 2: Carga de Documentos

Una vez verificado tu correo:

- Sube cada documento en formato PDF
- Asegúrate que sean legibles
- El tamaño máximo por archivo es 5MB

### Paso 3: Selección de Programa

Revisa los programas disponibles y selecciona:

| Programa | Duración | Jornada |
|----------|----------|---------|
| Desarrollo de Software | 24 meses | Diurna |
| Contabilidad | 18 meses | Nocturna |
| Diseño Gráfico | 12 meses | Mixta |

### Paso 4: Confirmación

- Revisa toda la información
- Acepta los términos y condiciones
- Descarga tu comprobante de matrícula

## Fechas Importantes

- **Inicio de inscripciones**: 15 de enero
- **Cierre de inscripciones**: 28 de febrero
- **Publicación de admitidos**: 5 de marzo
- **Inicio de clases**: 15 de marzo

## Preguntas Frecuentes

### ¿Puedo modificar mi información después de enviar?

Sí, puedes modificar tus datos hasta 48 horas después del envío inicial desde el módulo "Mis datos" en tu perfil.

### ¿Qué pasa si no tengo todos los documentos?

Puedes iniciar el proceso y completar la carga de documentos posteriormente, pero debes tener todos antes de la fecha límite.

## Contacto y Soporte

Si tienes dudas adicionales:

- **Email**: matriculas@sicora.edu.co
- **Teléfono**: (601) 123-4567
- **WhatsApp**: +57 300 123 4567
- **Horario**: Lunes a Viernes 8:00 AM - 5:00 PM

---

*Última actualización: Enero 2025*
  `,
  excerpt: 'Este documento describe el proceso completo de matrícula para nuevos aprendices, incluyendo los requisitos, documentación necesaria y plazos importantes.',
  type: 'guide',
  status: 'published',
  visibility: 'public',
  categoryId: 'cat-1',
  category: {
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
  tags: [
    { id: 'tag-1', name: 'Matrícula', slug: 'matricula', usageCount: 25, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'tag-2', name: 'Nuevos Aprendices', slug: 'nuevos-aprendices', usageCount: 12, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'tag-3', name: 'Requisitos', slug: 'requisitos', usageCount: 18, createdAt: '2025-01-01T00:00:00Z' },
  ],
  author: {
    id: 'user-1',
    name: 'María García',
    email: 'maria.garcia@sicora.edu',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=3b82f6&color=fff',
    role: 'Coordinadora Académica',
  },
  readingTimeMinutes: 8,
  wordCount: 650,
  viewCount: 1250,
  uniqueViewCount: 980,
  rating: 4.8,
  ratingCount: 156,
  bookmarkCount: 89,
  shareCount: 45,
  version: 3,
  publishedAt: '2025-01-15T10:00:00Z',
  createdAt: '2025-01-10T08:00:00Z',
  updatedAt: '2025-01-20T14:30:00Z',
};

const demoRelatedDocuments: SearchResult[] = [
  {
    id: 'doc-2',
    type: 'document',
    title: 'Requisitos para Becas y Subsidios',
    excerpt: 'Conoce los requisitos y proceso para solicitar becas y subsidios de estudio...',
    slug: 'requisitos-becas-subsidios',
    categoryName: 'Académico',
    tags: ['Becas', 'Subsidios'],
    score: 0.85,
    viewCount: 890,
    rating: 4.6,
    publishedAt: '2025-01-12T00:00:00Z',
  },
  {
    id: 'doc-3',
    type: 'document',
    title: 'Calendario Académico 2025',
    excerpt: 'Fechas importantes del calendario académico para el año 2025...',
    slug: 'calendario-academico-2025',
    categoryName: 'Académico',
    tags: ['Calendario', 'Fechas'],
    score: 0.78,
    viewCount: 1567,
    rating: 4.9,
    publishedAt: '2025-01-05T00:00:00Z',
  },
  {
    id: 'faq-1',
    type: 'faq',
    title: '¿Cómo verifico mi estado de matrícula?',
    excerpt: 'Para verificar tu estado de matrícula, ingresa al portal con tu usuario y contraseña...',
    slug: 'como-verifico-estado-matricula',
    categoryName: 'Académico',
    tags: ['Matrícula', 'Estado'],
    score: 0.92,
    viewCount: 2340,
    rating: 4.7,
    publishedAt: '2025-01-08T00:00:00Z',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface RatingComponentProps {
  currentRating: number;
  totalRatings: number;
  onRate: (rating: number) => void;
  userRating?: number;
}

function RatingComponent({ currentRating, totalRatings, onRate, userRating }: RatingComponentProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(!!userRating);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleRate = (rating: number) => {
    if (!hasRated) {
      onRate(rating);
      setHasRated(true);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4">¿Te fue útil este documento?</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => !hasRated && setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRate(star)}
              disabled={hasRated}
              className={`p-1 ${hasRated ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || userRating || 0)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{currentRating.toFixed(1)}</span>
          <span> ({totalRatings} valoraciones)</span>
        </div>
      </div>

      {showFeedback && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          <Check className="w-4 h-4" />
          <span className="text-sm">¡Gracias por tu valoración!</span>
        </div>
      )}

      {!hasRated && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">O responde rápidamente:</span>
          <button
            onClick={() => handleRate(5)}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">Sí, útil</span>
          </button>
          <button
            onClick={() => handleRate(2)}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-sm">No mucho</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface RelatedContentCardProps {
  content: SearchResult;
}

function RelatedContentCard({ content }: RelatedContentCardProps) {
  const isDocument = content.type === 'document';

  return (
    <Link
      href={`/kb/${isDocument ? 'documento' : 'faq'}/${content.id}`}
      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isDocument ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
          {isDocument ? <FileText className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">{content.title}</h4>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {content.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" />
              {content.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
    </Link>
  );
}

interface TableOfContentsProps {
  content: string;
}

function TableOfContents({ content }: TableOfContentsProps) {
  const headings = content.match(/^#{1,3}\s+.+$/gm) || [];

  const getTocItemClass = (level: number) => {
    if (level === 1) return 'font-medium text-gray-900';
    if (level === 2) return 'pl-3 text-gray-700';
    return 'pl-6 text-gray-500';
  };
  
  const tocItems = headings.map((heading, index) => {
    const level = heading.match(/^#+/)?.[0].length || 1;
    const text = heading.replace(/^#+\s+/, '');
    const id = text.toLowerCase().replaceAll(/\s+/g, '-').replaceAll(/[^\w-]/g, '');
    return { level, text, id, index };
  });

  if (tocItems.length < 3) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Contenido</h3>
      <nav className="space-y-1">
        {tocItems.map((item) => (
          <a
            key={item.index}
            href={`#${item.id}`}
            className={`block text-sm hover:text-blue-600 transition-colors ${getTocItemClass(item.level)}`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface DocumentoDetailContentProps {
  documentId: string;
}

export default function DocumentoDetailContent({ documentId }: DocumentoDetailContentProps) {
  // Estado
  const [document, setDocument] = useState<KBDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState<number | undefined>(undefined);

  // Store
  const { setSelectedDocument } = useKBStore();

  // Cargar documento
  useEffect(() => {
    let isMounted = true;
    // Simular carga (isLoading ya es true por defecto)
    const timer = setTimeout(() => {
      if (!isMounted) return;
      if (documentId === 'doc-1' || documentId) {
        setDocument(demoDocument);
        setIsLoading(false);
      } else {
        setError('Documento no encontrado');
        setIsLoading(false);
      }
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [documentId]);

  // Sincronizar documento seleccionado con el store
  useEffect(() => {
    if (document) {
      // Usar startTransition para evitar cascading renders en React 19
      startTransition(() => {
        setSelectedDocument(document);
      });
    }
  }, [document, setSelectedDocument]);

  // Handlers
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(globalThis.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: document?.title,
        text: document?.excerpt,
        url: globalThis.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    globalThis.print();
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
    // Aquí se enviaría al servidor
  };

  // Renderizar contenido markdown simple
  const renderContent = (content: string) => {
    // Convertir markdown básico a HTML
    const html = content
      .replaceAll(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3" id="$1">$1</h3>')
      .replaceAll(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-4" id="$1">$1</h2>')
      .replaceAll(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4" id="$1">$1</h1>')
      .replaceAll(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replaceAll(/\*(.+?)\*/g, '<em>$1</em>')
      .replaceAll(/^\d+\.\s+(.+)$/gm, '<li class="ml-6 list-decimal">$1</li>')
      .replaceAll(/^-\s+(.+)$/gm, '<li class="ml-6 list-disc">$1</li>')
      .replaceAll(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replaceAll(/^\|(.+)\|$/gm, (match) => {
        const cells = match.split('|').filter(Boolean).map(c => c.trim());
        return '<tr>' + cells.map(c => `<td class="border px-4 py-2">${c}</td>`).join('') + '</tr>';
      })
      .replaceAll(/^---$/gm, '<hr class="my-6 border-gray-200" />')
      .replaceAll('\n\n', '</p><p class="mb-4">')
      .replaceAll('\n', '<br />');

    return `<div class="prose prose-blue max-w-none"><p class="mb-4">${html}</p></div>`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Documento no encontrado</h2>
          <p className="text-gray-500 mb-4">{error || 'El documento que buscas no existe o fue eliminado'}</p>
          <Link href="/kb" className="text-blue-600 hover:underline">
            Volver a la base de conocimiento
          </Link>
        </div>
      </div>
    );
  }

  const typeConfig = DOCUMENT_TYPE_CONFIG[document.type];
  const statusConfig = DOCUMENT_STATUS_CONFIG[document.status];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb y acciones */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/kb" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Base de Conocimiento
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link href={`/kb?category=${document.categoryId}`} className="text-gray-500 hover:text-gray-700">
                {document.category?.name}
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 truncate max-w-xs">{document.title}</span>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                title={isBookmarked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                title="Compartir"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                title={copied ? '¡Copiado!' : 'Copiar enlace'}
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                title="Imprimir"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Contenido del documento */}
          <div className="lg:col-span-3">
            <article className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700`}>
                    {typeConfig.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}>
                    {statusConfig.label}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">{document.title}</h1>

                <p className="text-gray-600 mb-4">{document.excerpt}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {document.author.avatar && (
                      <Image
                        src={document.author.avatar}
                        alt={document.author.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span>{document.author.name}</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(document.publishedAt || document.createdAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {document.readingTimeMinutes} min lectura
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {document.viewCount.toLocaleString()} vistas
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    {document.rating.toFixed(1)} ({document.ratingCount})
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {document.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/kb?tag=${tag.slug}`}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contenido */}
              <div 
                className="p-6"
                dangerouslySetInnerHTML={{ __html: renderContent(document.content) }}
              />
            </article>

            {/* Rating */}
            <div className="mt-6">
              <RatingComponent
                currentRating={document.rating}
                totalRatings={document.ratingCount}
                onRate={handleRate}
                userRating={userRating}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tabla de contenidos */}
            <TableOfContents content={document.content} />

            {/* Categoría */}
            {document.category && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categoría</h3>
                <Link
                  href={`/kb?category=${document.categoryId}`}
                  className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{document.category.name}</span>
                </Link>
              </div>
            )}

            {/* Contenido relacionado */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Contenido Relacionado</h3>
              <div className="space-y-2">
                {demoRelatedDocuments.map((content) => (
                  <RelatedContentCard key={content.id} content={content} />
                ))}
              </div>
            </div>

            {/* Información del documento */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Información</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Versión</dt>
                  <dd className="text-gray-900">v{document.version}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Palabras</dt>
                  <dd className="text-gray-900">{document.wordCount.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Guardados</dt>
                  <dd className="text-gray-900">{document.bookmarkCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Compartidos</dt>
                  <dd className="text-gray-900">{document.shareCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Actualizado</dt>
                  <dd className="text-gray-900">
                    {new Date(document.updatedAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
