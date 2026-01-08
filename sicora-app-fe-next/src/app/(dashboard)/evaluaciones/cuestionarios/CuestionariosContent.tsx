'use client';

/**
 * Página de Cuestionarios - EvalinService
 * CRUD de cuestionarios con constructor de preguntas
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  FileText,
  CheckCircle,
  Clock,
  Archive,
  ChevronDown,
  ChevronUp,
  Star,
  BarChart,
  CheckSquare,
  Circle,
  ToggleLeft,
  Grid,
  Save,
  X,
  AlertTriangle,
  Users,
  GraduationCap,
  UserCog,
  User,
  Play,
  Pause,
} from 'lucide-react';
import { useEvalinStore } from '@/stores/evalinStore';
import type {
  Questionnaire,
  Question,
  QuestionCategory,
  QuestionnaireStatus,
  EvaluatorRole,
  QuestionType,
} from '@/types/evalin.types';
import {
  QUESTION_TYPE_CONFIG,
  EVALUATOR_ROLE_CONFIG,
  LIKERT_OPTIONS,
} from '@/types/evalin.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoCategories: QuestionCategory[] = [
  {
    id: 'cat-1',
    name: 'Conocimiento y Dominio',
    description: 'Evaluación del conocimiento técnico del instructor',
    order: 1,
    weight: 30,
    isRequired: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Metodología y Didáctica',
    description: 'Evaluación de las técnicas de enseñanza',
    order: 2,
    weight: 25,
    isRequired: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Relación con Estudiantes',
    description: 'Evaluación de la interacción instructor-estudiante',
    order: 3,
    weight: 25,
    isRequired: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Puntualidad y Responsabilidad',
    description: 'Evaluación del cumplimiento de compromisos',
    order: 4,
    weight: 20,
    isRequired: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const demoQuestions: Question[] = [
  {
    id: 'q-1',
    text: '¿El instructor demuestra dominio del tema?',
    description: 'Evalúe el nivel de conocimiento técnico mostrado en clase',
    type: 'likert',
    categoryId: 'cat-1',
    isRequired: true,
    options: LIKERT_OPTIONS,
    order: 1,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'q-2',
    text: '¿El instructor explica los conceptos de forma clara?',
    type: 'likert',
    categoryId: 'cat-2',
    isRequired: true,
    options: LIKERT_OPTIONS,
    order: 2,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'q-3',
    text: '¿El instructor utiliza ejemplos prácticos?',
    type: 'likert',
    categoryId: 'cat-2',
    isRequired: true,
    options: LIKERT_OPTIONS,
    order: 3,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'q-4',
    text: '¿El instructor fomenta la participación?',
    type: 'likert',
    categoryId: 'cat-3',
    isRequired: true,
    options: LIKERT_OPTIONS,
    order: 4,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'q-5',
    text: '¿El instructor es puntual en sus clases?',
    type: 'likert',
    categoryId: 'cat-4',
    isRequired: true,
    options: LIKERT_OPTIONS,
    order: 5,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'q-6',
    text: '¿Qué aspectos positivos destacaría del instructor?',
    type: 'text',
    categoryId: 'cat-3',
    isRequired: false,
    minLength: 20,
    maxLength: 500,
    order: 6,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'q-7',
    text: '¿Recomendaría este instructor a otros estudiantes?',
    type: 'yes_no',
    categoryId: 'cat-3',
    isRequired: true,
    order: 7,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'q-8',
    text: 'Califique al instructor del 1 al 10',
    type: 'rating',
    categoryId: 'cat-1',
    isRequired: true,
    minValue: 1,
    maxValue: 10,
    order: 8,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const demoQuestionnaires: Questionnaire[] = [
  {
    id: 'qn-1',
    name: 'Evaluación Docente Semestral',
    description: 'Cuestionario estándar de evaluación de instructores por parte de estudiantes',
    instructions: 'Por favor responda con honestidad. Sus respuestas son anónimas y servirán para mejorar la calidad educativa.',
    status: 'active',
    evaluatorRole: 'student',
    estimatedTimeMinutes: 15,
    allowPartialSave: true,
    anonymousResponses: true,
    categories: demoCategories,
    questions: demoQuestions.slice(0, 6),
    totalQuestions: 6,
    version: 1,
    createdBy: 'admin-1',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'qn-2',
    name: 'Evaluación entre Pares',
    description: 'Cuestionario para evaluación entre instructores',
    instructions: 'Evalúe a su colega basándose en las observaciones de clase realizadas.',
    status: 'active',
    evaluatorRole: 'peer',
    estimatedTimeMinutes: 20,
    allowPartialSave: true,
    anonymousResponses: false,
    categories: demoCategories.slice(0, 2),
    questions: demoQuestions.slice(0, 4),
    totalQuestions: 4,
    version: 1,
    createdBy: 'admin-1',
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
  {
    id: 'qn-3',
    name: 'Autoevaluación Docente',
    description: 'Cuestionario de autoevaluación para instructores',
    instructions: 'Reflexione sobre su desempeño durante el período y responda con sinceridad.',
    status: 'draft',
    evaluatorRole: 'self',
    estimatedTimeMinutes: 25,
    allowPartialSave: true,
    anonymousResponses: false,
    categories: demoCategories,
    questions: demoQuestions,
    totalQuestions: 8,
    version: 1,
    createdBy: 'admin-1',
    createdAt: '2025-01-25T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
  },
  {
    id: 'qn-4',
    name: 'Evaluación Coordinación',
    description: 'Evaluación del coordinador al instructor',
    status: 'inactive',
    evaluatorRole: 'coordinator',
    estimatedTimeMinutes: 30,
    allowPartialSave: false,
    anonymousResponses: false,
    categories: demoCategories,
    questions: demoQuestions,
    totalQuestions: 8,
    version: 2,
    createdBy: 'admin-1',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const StatusBadge = ({ status }: { status: QuestionnaireStatus }) => {
  const config: Record<QuestionnaireStatus, { label: string; color: string; icon: React.ReactNode }> = {
    draft: {
      label: 'Borrador',
      color: 'bg-gray-100 text-gray-700',
      icon: <Edit className="h-3 w-3" />,
    },
    active: {
      label: 'Activo',
      color: 'bg-green-100 text-green-700',
      icon: <CheckCircle className="h-3 w-3" />,
    },
    inactive: {
      label: 'Inactivo',
      color: 'bg-amber-100 text-amber-700',
      icon: <Pause className="h-3 w-3" />,
    },
    archived: {
      label: 'Archivado',
      color: 'bg-gray-100 text-gray-500',
      icon: <Archive className="h-3 w-3" />,
    },
  };

  const { label, color, icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};

const RoleBadge = ({ role }: { role: EvaluatorRole }) => {
  const config = EVALUATOR_ROLE_CONFIG[role];
  const icons: Record<EvaluatorRole, React.ReactNode> = {
    student: <GraduationCap className="h-3 w-3" />,
    peer: <Users className="h-3 w-3" />,
    coordinator: <UserCog className="h-3 w-3" />,
    self: <User className="h-3 w-3" />,
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      {icons[role]}
      {config.label}
    </span>
  );
};

const QuestionTypeIcon = ({ type }: { type: QuestionType }) => {
  const icons: Record<QuestionType, React.ReactNode> = {
    rating: <Star className="h-4 w-4" />,
    likert: <BarChart className="h-4 w-4" />,
    text: <FileText className="h-4 w-4" />,
    multiple_choice: <CheckSquare className="h-4 w-4" />,
    single_choice: <Circle className="h-4 w-4" />,
    yes_no: <ToggleLeft className="h-4 w-4" />,
    matrix: <Grid className="h-4 w-4" />,
  };

  return (
    <span className="text-gray-500" title={QUESTION_TYPE_CONFIG[type].label}>
      {icons[type]}
    </span>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CuestionariosContent() {
  const {
    questionnaires,
    questions,
    categories,
    selectedQuestionnaire,
    questionnairesFilters,
    modals,
    setQuestionnaires,
    setQuestions,
    setCategories,
    setSelectedQuestionnaire,
    setQuestionnairesFilters,
    addQuestionnaire,
    updateQuestionnaire,
    removeQuestionnaire,
    openModal,
    closeModal,
  } = useEvalinStore();

  const [localSearch, setLocalSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedQuestionnaire, setExpandedQuestionnaire] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Cargar datos demo al montar
  useEffect(() => {
    setQuestionnaires(demoQuestionnaires);
    setQuestions(demoQuestions);
    setCategories(demoCategories);
  }, [setQuestionnaires, setQuestions, setCategories]);

  // Filtrar cuestionarios
  const filteredQuestionnaires = questionnaires.filter((q) => {
    const matchesSearch =
      !localSearch ||
      q.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      q.description?.toLowerCase().includes(localSearch.toLowerCase());

    const matchesStatus =
      !questionnairesFilters.status || q.status === questionnairesFilters.status;

    const matchesRole =
      !questionnairesFilters.evaluatorRole ||
      q.evaluatorRole === questionnairesFilters.evaluatorRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionnairesFilters({ search: localSearch });
  };

  const handleStatusFilter = (status: QuestionnaireStatus | null) => {
    setQuestionnairesFilters({ status });
  };

  const handleRoleFilter = (role: EvaluatorRole | null) => {
    setQuestionnairesFilters({ evaluatorRole: role });
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    openModal('questionnaireEditor');
  };

  const handleView = (questionnaire: Questionnaire) => {
    setExpandedQuestionnaire(
      expandedQuestionnaire === questionnaire.id ? null : questionnaire.id
    );
  };

  const handleDuplicate = (questionnaire: Questionnaire) => {
    const newQuestionnaire: Questionnaire = {
      ...questionnaire,
      id: `qn-${Date.now()}`,
      name: `${questionnaire.name} (Copia)`,
      status: 'draft',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addQuestionnaire(newQuestionnaire);
  };

  const handleDelete = (id: string) => {
    removeQuestionnaire(id);
    setShowDeleteConfirm(null);
  };

  const handleToggleStatus = (questionnaire: Questionnaire) => {
    const newStatus: QuestionnaireStatus =
      questionnaire.status === 'active' ? 'inactive' : 'active';
    updateQuestionnaire(questionnaire.id, { status: newStatus });
  };

  const handleCreateNew = () => {
    setSelectedQuestionnaire(null);
    openModal('questionnaireEditor');
  };

  // Stats
  const stats = {
    total: questionnaires.length,
    active: questionnaires.filter((q) => q.status === 'active').length,
    draft: questionnaires.filter((q) => q.status === 'draft').length,
    totalQuestions: questions.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuestionarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestione los cuestionarios de evaluación de instructores
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cuestionario
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Edit className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              <p className="text-xs text-gray-500">Borradores</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
              <p className="text-xs text-gray-500">Preguntas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar cuestionarios..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">Estado</legend>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusFilter(null)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    questionnairesFilters.status === null
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                {(['active', 'draft', 'inactive', 'archived'] as QuestionnaireStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      questionnairesFilters.status === status
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <StatusBadge status={status} />
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evaluador</legend>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleRoleFilter(null)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    questionnairesFilters.evaluatorRole === null
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                {(['student', 'peer', 'coordinator', 'self'] as EvaluatorRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleFilter(role)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      questionnairesFilters.evaluatorRole === role
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <RoleBadge role={role} />
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </div>

      {/* Questionnaires List */}
      <div className="space-y-4">
        {filteredQuestionnaires.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron cuestionarios
            </h3>
            <p className="text-gray-500 mb-4">
              {questionnaires.length === 0
                ? 'Comience creando su primer cuestionario'
                : 'Intente ajustar los filtros de búsqueda'}
            </p>
            {questionnaires.length === 0 && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Crear Cuestionario
              </button>
            )}
          </div>
        ) : (
          filteredQuestionnaires.map((questionnaire) => (
            <div
              key={questionnaire.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Main Row */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {questionnaire.name}
                      </h3>
                      <StatusBadge status={questionnaire.status} />
                      <RoleBadge role={questionnaire.evaluatorRole} />
                    </div>
                    {questionnaire.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {questionnaire.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {questionnaire.totalQuestions} preguntas
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ~{questionnaire.estimatedTimeMinutes} min
                      </span>
                      {questionnaire.anonymousResponses && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Anónimo
                        </span>
                      )}
                      <span>v{questionnaire.version}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(questionnaire)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Ver preguntas"
                    >
                      {expandedQuestionnaire === questionnaire.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(questionnaire)}
                      className={`p-2 rounded-lg transition-colors ${
                        questionnaire.status === 'active'
                          ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={questionnaire.status === 'active' ? 'Desactivar' : 'Activar'}
                    >
                      {questionnaire.status === 'active' ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(questionnaire)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(questionnaire)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(questionnaire.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Questions */}
              {expandedQuestionnaire === questionnaire.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Preguntas del cuestionario
                  </h4>
                  {questionnaire.questions.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      Este cuestionario no tiene preguntas asignadas
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {questionnaire.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{question.text}</p>
                            {question.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {question.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <QuestionTypeIcon type={question.type} />
                            {question.isRequired && (
                              <span className="text-xs text-red-500">*</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {questionnaire.instructions && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Instrucciones:</strong> {questionnaire.instructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Confirmation */}
              {showDeleteConfirm === questionnaire.id && (
                <div className="border-t border-gray-200 bg-red-50 p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        ¿Está seguro de eliminar este cuestionario?
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDelete(questionnaire.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Editor Modal (simplificado) */}
      {modals.questionnaireEditor && (
        <QuestionnaireEditorModal
          questionnaire={selectedQuestionnaire}
          categories={categories}
          questions={questions}
          onSave={(data) => {
            if (selectedQuestionnaire) {
              updateQuestionnaire(selectedQuestionnaire.id, data);
            } else {
              const newQuestionnaire: Questionnaire = {
                id: `qn-${Date.now()}`,
                name: data.name || 'Nuevo Cuestionario',
                description: data.description,
                instructions: data.instructions,
                status: 'draft',
                evaluatorRole: data.evaluatorRole || 'student',
                estimatedTimeMinutes: data.estimatedTimeMinutes || 15,
                allowPartialSave: data.allowPartialSave ?? true,
                anonymousResponses: data.anonymousResponses ?? true,
                categories: [],
                questions: [],
                totalQuestions: 0,
                version: 1,
                createdBy: 'current-user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              addQuestionnaire(newQuestionnaire);
            }
            closeModal('questionnaireEditor');
          }}
          onClose={() => closeModal('questionnaireEditor')}
        />
      )}
    </div>
  );
}

// ============================================================================
// MODAL DE EDITOR
// ============================================================================

interface QuestionnaireEditorModalProps {
  questionnaire: Questionnaire | null;
  categories: QuestionCategory[];
  questions: Question[];
  onSave: (data: Partial<Questionnaire>) => void;
  onClose: () => void;
}

function QuestionnaireEditorModal({
  questionnaire,
  categories,
  questions,
  onSave,
  onClose,
}: QuestionnaireEditorModalProps) {
  const [formData, setFormData] = useState({
    name: questionnaire?.name || '',
    description: questionnaire?.description || '',
    instructions: questionnaire?.instructions || '',
    evaluatorRole: questionnaire?.evaluatorRole || 'student' as EvaluatorRole,
    estimatedTimeMinutes: questionnaire?.estimatedTimeMinutes || 15,
    allowPartialSave: questionnaire?.allowPartialSave ?? true,
    anonymousResponses: questionnaire?.anonymousResponses ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {questionnaire ? 'Editar Cuestionario' : 'Nuevo Cuestionario'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div>
            <label htmlFor="questionnaire-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cuestionario *
            </label>
            <input
              id="questionnaire-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Evaluación Docente Semestral"
            />
          </div>

          <div>
            <label htmlFor="questionnaire-description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="questionnaire-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describa el propósito del cuestionario..."
            />
          </div>

          <div>
            <label htmlFor="questionnaire-instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Instrucciones para el Evaluador
            </label>
            <textarea
              id="questionnaire-instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Instrucciones que verá el evaluador antes de comenzar..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="questionnaire-role" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Evaluador *
              </label>
              <select
                id="questionnaire-role"
                value={formData.evaluatorRole}
                onChange={(e) =>
                  setFormData({ ...formData, evaluatorRole: e.target.value as EvaluatorRole })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(EVALUATOR_ROLE_CONFIG).map(([role, config]) => (
                  <option key={role} value={role}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="questionnaire-time" className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo Estimado (min)
              </label>
              <input
                id="questionnaire-time"
                type="number"
                value={formData.estimatedTimeMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedTimeMinutes: Number.parseInt(e.target.value) || 15,
                  })
                }
                min={1}
                max={120}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.allowPartialSave}
                onChange={(e) =>
                  setFormData({ ...formData, allowPartialSave: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Permitir guardar progreso parcial
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.anonymousResponses}
                onChange={(e) =>
                  setFormData({ ...formData, anonymousResponses: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Respuestas anónimas
              </span>
            </label>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            {questionnaire ? 'Guardar Cambios' : 'Crear Cuestionario'}
          </button>
        </div>
      </div>
    </div>
  );
}
