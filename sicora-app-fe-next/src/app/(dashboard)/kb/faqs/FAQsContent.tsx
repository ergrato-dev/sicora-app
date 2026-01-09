'use client';

/**
 * Página de FAQs - Knowledge Base
 * Lista de preguntas frecuentes con búsqueda y categorías
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  HelpCircle,
  ChevronDown,
  Star,
  Eye,
  ThumbsUp,
  ThumbsDown,
  FolderOpen,
  X,
  ArrowLeft,
  Pin,
  Loader2,
} from 'lucide-react';
import { useKBStore } from '@/stores/kbStore';
import type { FAQ, KBCategory } from '@/types/kb.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoCategories: KBCategory[] = [
  {
    id: 'cat-1',
    name: 'Académico',
    slug: 'academico',
    description: 'Preguntas sobre temas académicos',
    icon: 'GraduationCap',
    color: 'blue',
    sortOrder: 1,
    documentCount: 15,
    faqCount: 12,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Administrativo',
    slug: 'administrativo',
    description: 'Trámites y procesos administrativos',
    icon: 'Building',
    color: 'purple',
    sortOrder: 2,
    documentCount: 12,
    faqCount: 18,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Técnico',
    slug: 'tecnico',
    description: 'Soporte técnico y plataforma',
    icon: 'Settings',
    color: 'slate',
    sortOrder: 3,
    documentCount: 8,
    faqCount: 25,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'General',
    slug: 'general',
    description: 'Preguntas generales',
    icon: 'Info',
    color: 'gray',
    sortOrder: 4,
    documentCount: 5,
    faqCount: 10,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const demoFAQs: FAQ[] = [
  {
    id: 'faq-1',
    question: '¿Cómo justifico una inasistencia?',
    answer: `Para justificar una inasistencia, sigue estos pasos:

1. **Ingresa al módulo de Justificaciones** desde el menú principal
2. **Selecciona "Nueva Justificación"** y elige la fecha de la inasistencia
3. **Selecciona el tipo de justificación** (médica, calamidad, permiso, etc.)
4. **Adjunta los documentos de soporte** si son requeridos
5. **Describe brevemente el motivo** de la inasistencia
6. **Envía la solicitud** para revisión del coordinador

**Importante:** Las justificaciones deben enviarse dentro de los 3 días hábiles siguientes a la inasistencia.

**Documentos requeridos según el tipo:**
- Médica: Certificado médico o incapacidad
- Calamidad: Documento que acredite el evento
- Permiso: Aprobación previa del coordinador`,
    slug: 'como-justifico-inasistencia',
    categoryId: 'cat-2',
    tags: [
      { id: 'tag-3', name: 'Asistencia', slug: 'asistencia', usageCount: 22, createdAt: '2025-01-01T00:00:00Z' },
      { id: 'tag-8', name: 'Justificaciones', slug: 'justificaciones', usageCount: 15, createdAt: '2025-01-01T00:00:00Z' },
    ],
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
    updatedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: 'faq-2',
    question: '¿Dónde consulto mi horario de clases?',
    answer: `Tu horario de clases está disponible en el módulo de **Horarios**:

1. Ingresa al menú principal y selecciona "Horarios"
2. Verás tu horario semanal con todas tus clases programadas
3. Puedes cambiar la vista entre semanal, diaria o mensual
4. Utiliza los botones de navegación para ver semanas anteriores o futuras

**Información mostrada:**
- Nombre del curso
- Instructor asignado
- Ambiente/Salón
- Hora de inicio y fin

**Opciones adicionales:**
- Descargar en PDF
- Sincronizar con Google Calendar
- Recibir notificaciones de cambios`,
    slug: 'donde-consulto-horario-clases',
    categoryId: 'cat-1',
    tags: [
      { id: 'tag-7', name: 'Horarios', slug: 'horarios', usageCount: 18, createdAt: '2025-01-01T00:00:00Z' },
    ],
    status: 'published',
    viewCount: 4280,
    helpfulCount: 4000,
    notHelpfulCount: 80,
    rating: 4.8,
    author: { id: 'user-1', name: 'Admin Sistema', email: 'admin@sicora.edu', role: 'admin' },
    sortOrder: 2,
    isFeatured: true,
    isPinned: true,
    publishedAt: '2025-01-01T00:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-18T00:00:00Z',
  },
  {
    id: 'faq-3',
    question: '¿Cómo recupero mi contraseña de SICORA?',
    answer: `Si olvidaste tu contraseña, puedes recuperarla fácilmente:

1. Ve a la página de inicio de sesión
2. Haz clic en **"¿Olvidaste tu contraseña?"**
3. Ingresa tu correo electrónico institucional
4. Revisa tu bandeja de entrada (también spam)
5. Haz clic en el enlace de recuperación
6. Crea una nueva contraseña segura

**Requisitos de la nueva contraseña:**
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos un número
- Al menos un carácter especial

**¿No recibes el correo?**
- Verifica que el correo sea el correcto
- Espera hasta 5 minutos
- Revisa la carpeta de spam
- Si persiste el problema, contacta a soporte técnico`,
    slug: 'como-recupero-contrasena-sicora',
    categoryId: 'cat-3',
    tags: [
      { id: 'tag-6', name: 'Contraseña', slug: 'contrasena', usageCount: 20, createdAt: '2025-01-01T00:00:00Z' },
      { id: 'tag-5', name: 'Plataforma', slug: 'plataforma', usageCount: 30, createdAt: '2025-01-01T00:00:00Z' },
    ],
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
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'faq-4',
    question: '¿Cómo descargo mi certificado de estudios?',
    answer: `Los certificados están disponibles en el módulo de Trámites:

1. Ingresa a **Trámites > Certificados**
2. Selecciona el tipo de certificado que necesitas
3. Verifica que tu información esté correcta
4. Haz clic en "Generar Certificado"
5. Descarga el PDF o solicita copia física

**Tipos de certificados disponibles:**
- Certificado de matrícula activa
- Certificado de notas
- Constancia de asistencia
- Certificado de competencias adquiridas

**Requisitos:**
- Estar al día con obligaciones académicas
- No tener sanciones activas`,
    slug: 'como-descargo-certificado-estudios',
    categoryId: 'cat-2',
    tags: [
      { id: 'tag-2', name: 'Certificados', slug: 'certificados', usageCount: 18, createdAt: '2025-01-01T00:00:00Z' },
      { id: 'tag-9', name: 'Trámites', slug: 'tramites', usageCount: 25, createdAt: '2025-01-01T00:00:00Z' },
    ],
    status: 'published',
    viewCount: 3210,
    helpfulCount: 2980,
    notHelpfulCount: 70,
    rating: 4.6,
    author: { id: 'user-1', name: 'Admin Sistema', email: 'admin@sicora.edu', role: 'admin' },
    sortOrder: 4,
    isFeatured: false,
    isPinned: false,
    publishedAt: '2025-01-02T00:00:00Z',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    id: 'faq-5',
    question: '¿Cuál es el porcentaje mínimo de asistencia requerido?',
    answer: `El porcentaje mínimo de asistencia varía según el programa:

**Programas técnicos:** 80% de asistencia mínima
**Programas tecnológicos:** 80% de asistencia mínima
**Cursos cortos:** 90% de asistencia mínima

**Consecuencias del incumplimiento:**
- Entre 75% y 80%: Alerta y compromiso académico
- Entre 70% y 75%: Riesgo de pérdida de competencia
- Menos de 70%: Pérdida automática de la competencia

**Justificaciones válidas:**
Las inasistencias justificadas con documentación válida se descuentan del cálculo de asistencia requerida.`,
    slug: 'porcentaje-minimo-asistencia-requerido',
    categoryId: 'cat-1',
    tags: [
      { id: 'tag-3', name: 'Asistencia', slug: 'asistencia', usageCount: 22, createdAt: '2025-01-01T00:00:00Z' },
      { id: 'tag-10', name: 'Normativa', slug: 'normativa', usageCount: 12, createdAt: '2025-01-01T00:00:00Z' },
    ],
    status: 'published',
    viewCount: 2890,
    helpfulCount: 2650,
    notHelpfulCount: 100,
    rating: 4.5,
    author: { id: 'user-1', name: 'Admin Sistema', email: 'admin@sicora.edu', role: 'admin' },
    sortOrder: 5,
    isFeatured: false,
    isPinned: false,
    publishedAt: '2025-01-03T00:00:00Z',
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'faq-6',
    question: '¿Cómo reporto un problema técnico en la plataforma?',
    answer: `Puedes reportar problemas técnicos de varias formas:

**1. Desde la plataforma:**
- Ve a "Ayuda > Reportar problema"
- Describe el problema detalladamente
- Adjunta capturas de pantalla si es posible

**2. Por correo electrónico:**
- Escribe a: soporte@sicora.edu
- Incluye: tu usuario, descripción del problema, pasos para reproducirlo

**3. Mesa de ayuda:**
- Teléfono: (601) 123-4567 ext. 100
- Horario: Lunes a Viernes 7:00 AM - 6:00 PM

**Información útil para el reporte:**
- Navegador y versión
- Dispositivo utilizado
- Mensaje de error exacto
- Captura de pantalla del problema`,
    slug: 'como-reporto-problema-tecnico-plataforma',
    categoryId: 'cat-3',
    tags: [
      { id: 'tag-5', name: 'Plataforma', slug: 'plataforma', usageCount: 30, createdAt: '2025-01-01T00:00:00Z' },
      { id: 'tag-11', name: 'Soporte', slug: 'soporte', usageCount: 15, createdAt: '2025-01-01T00:00:00Z' },
    ],
    status: 'published',
    viewCount: 1850,
    helpfulCount: 1700,
    notHelpfulCount: 50,
    rating: 4.8,
    author: { id: 'user-1', name: 'Admin Sistema', email: 'admin@sicora.edu', role: 'admin' },
    sortOrder: 6,
    isFeatured: false,
    isPinned: false,
    publishedAt: '2025-01-04T00:00:00Z',
    createdAt: '2025-01-04T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
  },
  {
    id: 'faq-7',
    question: '¿Cómo actualizo mis datos personales?',
    answer: `Para actualizar tus datos personales:

1. Ingresa a **Mi Perfil** (clic en tu nombre, esquina superior derecha)
2. Selecciona **"Editar información"**
3. Modifica los campos que necesites actualizar
4. Haz clic en **"Guardar cambios"**

**Datos que puedes actualizar:**
- Dirección de residencia
- Teléfono de contacto
- Correo personal (adicional al institucional)
- Contacto de emergencia
- Foto de perfil

**Datos que NO puedes modificar:**
- Nombre completo (requiere trámite en registro)
- Documento de identidad
- Fecha de nacimiento
- Correo institucional`,
    slug: 'como-actualizo-datos-personales',
    categoryId: 'cat-4',
    tags: [
      { id: 'tag-12', name: 'Perfil', slug: 'perfil', usageCount: 10, createdAt: '2025-01-01T00:00:00Z' },
    ],
    status: 'published',
    viewCount: 1560,
    helpfulCount: 1450,
    notHelpfulCount: 40,
    rating: 4.7,
    author: { id: 'user-1', name: 'Admin Sistema', email: 'admin@sicora.edu', role: 'admin' },
    sortOrder: 7,
    isFeatured: false,
    isPinned: false,
    publishedAt: '2025-01-05T00:00:00Z',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface FAQItemProps {
  faq: FAQ;
  isExpanded: boolean;
  onToggle: () => void;
  onRate: (helpful: boolean) => void;
  userVote?: 'helpful' | 'not-helpful';
}

function FAQItem({ faq, isExpanded, onToggle, onRate, userVote }: FAQItemProps) {
  const renderAnswer = (answer: string) => {
    // Convertir markdown básico a HTML
    const html = answer
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-6 list-decimal">$1</li>')
      .replace(/^-\s+(.+)$/gm, '<li class="ml-6 list-disc">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br />');
    
    return `<p class="mb-3">${html}</p>`;
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-green-300 shadow-md' : 'border-gray-200'}`}>
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-start gap-4 hover:bg-gray-50 transition-colors"
      >
        <div className={`p-2 rounded-lg flex-shrink-0 ${isExpanded ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {faq.isPinned && (
              <Pin className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
            {faq.isFeatured && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
          </div>
          <h3 className={`font-medium ${isExpanded ? 'text-green-700' : 'text-gray-900'}`}>
            {faq.question}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {faq.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              {faq.helpfulCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              {faq.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <div className={`p-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div 
            className="prose prose-sm max-w-none text-gray-600 mb-4 ml-14"
            dangerouslySetInnerHTML={{ __html: renderAnswer(faq.answer) }}
          />

          {/* Tags */}
          {faq.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4 ml-14">
              {faq.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Votación */}
          <div className="flex items-center gap-4 ml-14 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">¿Te fue útil esta respuesta?</span>
            <button
              onClick={() => onRate(true)}
              disabled={!!userVote}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                userVote === 'helpful'
                  ? 'bg-green-100 text-green-700'
                  : 'hover:bg-green-50 text-gray-600'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">Sí</span>
            </button>
            <button
              onClick={() => onRate(false)}
              disabled={!!userVote}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                userVote === 'not-helpful'
                  ? 'bg-red-100 text-red-700'
                  : 'hover:bg-red-50 text-gray-600'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm">No</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryButtonProps {
  category: KBCategory;
  isActive: boolean;
  onClick: () => void;
}

function CategoryButton({ category, isActive, onClick }: CategoryButtonProps) {
  const colorClasses: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    gray: 'border-gray-200 bg-gray-50 text-gray-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
        isActive
          ? colorClasses[category.color || 'gray']
          : 'border-gray-200 hover:border-gray-300 text-gray-600'
      }`}
    >
      <FolderOpen className="w-4 h-4" />
      <span className="font-medium">{category.name}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/50' : 'bg-gray-100'}`}>
        {category.faqCount}
      </span>
    </button>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function FAQsContent() {
  // Estado local
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
  const [userVotes, setUserVotes] = useState<Record<string, 'helpful' | 'not-helpful'>>({});
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');

  // Store
  const { faqs, setFAQs, isLoading } = useKBStore();

  // Datos
  const categories = demoCategories;
  const faqList = faqs.length > 0 ? faqs : demoFAQs;

  // Filtrar FAQs
  const filteredFAQs = useMemo(() => {
    let result = faqList;

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    // Filtrar por categoría
    if (selectedCategory) {
      result = result.filter((faq) => faq.categoryId === selectedCategory);
    }

    // Ordenar
    switch (sortBy) {
      case 'popular':
        result = [...result].sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'recent':
        result = [...result].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
    }

    // Pinned primero
    result = [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    return result;
  }, [faqList, searchQuery, selectedCategory, sortBy]);

  // Handlers
  const toggleFAQ = (id: string) => {
    setExpandedFAQs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRate = (faqId: string, helpful: boolean) => {
    setUserVotes((prev) => ({
      ...prev,
      [faqId]: helpful ? 'helpful' : 'not-helpful',
    }));
    // Aquí se enviaría al servidor
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  // Cargar datos al montar
  useEffect(() => {
    // En producción cargaría desde la API
    setFAQs(demoFAQs);
  }, [setFAQs]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link
            href="/kb"
            className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Base de Conocimiento
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-xl mb-4">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Preguntas Frecuentes</h1>
            <p className="text-green-100">
              Encuentra respuestas rápidas a las preguntas más comunes
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en preguntas frecuentes..."
              className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6">
          {/* Categorías */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl border-2 transition-all ${
                !selectedCategory
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              Todas ({faqList.length})
            </button>
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={selectedCategory === category.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )
                }
              />
            ))}
          </div>

          {/* Ordenar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'resultado' : 'resultados'}
              </span>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="popular">Más vistas</option>
                <option value="rating">Mejor valoradas</option>
                <option value="recent">Más recientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de FAQs */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : filteredFAQs.length > 0 ? (
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedFAQs.has(faq.id)}
                onToggle={() => toggleFAQ(faq.id)}
                onRate={(helpful) => handleRate(faq.id, helpful)}
                userVote={userVotes[faq.id]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              No se encontraron preguntas
            </h3>
            <p className="text-gray-500 mb-4">
              Intenta con otros términos de búsqueda o selecciona otra categoría
            </p>
            <button
              onClick={clearFilters}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Ver todas las preguntas
            </button>
          </div>
        )}

        {/* ¿No encontraste lo que buscabas? */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-gray-500 mb-4">
            Puedes buscar en toda la base de conocimiento o contactar a soporte
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/kb"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar en KB
            </Link>
            <Link
              href="/soporte"
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
