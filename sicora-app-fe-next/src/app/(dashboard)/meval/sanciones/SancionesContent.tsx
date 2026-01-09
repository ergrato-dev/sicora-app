'use client';

/**
 * Página de Sanciones - MevalService
 * Gestión de sanciones activas e historial
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Ban,
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronRight,
  Calendar,
  User,
  FileText,
  Shield,
  Loader2,
  Eye,
  Bell,
  Scale,
} from 'lucide-react';
import { useMevalStore } from '@/stores/mevalStore';
import type { Sanction, SanctionStatus, SanctionType } from '@/types/meval.types';
import { SANCTION_STATUS_CONFIG, SANCTION_TYPE_CONFIG } from '@/types/meval.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoSanctions: Sanction[] = [
  {
    id: 'sanction-1',
    studentCaseId: 'case-2',
    student: {
      id: 'student-2',
      documentNumber: '0987654321',
      fullName: 'Ana María Rodríguez López',
      email: 'ana.rodriguez@email.com',
      programId: 'prog-2',
      programName: 'Tecnología en Análisis de Datos',
      groupId: 'group-2',
      groupName: 'DATOS-2024-02',
      enrollmentDate: '2024-03-01',
      status: 'active',
    },
    type: 'written_warning',
    description: 'Amonestación escrita por conducta inapropiada en ambiente de formación. Se deja constancia en el historial académico.',
    legalBasis: 'Reglamento del Aprendiz, Artículo 15, numeral 3',
    startDate: '2026-01-08',
    status: 'active',
    appliedBy: 'admin-1',
    appliedByName: 'Dr. Juan Pérez',
    appliedAt: '2026-01-08T10:00:00Z',
    studentNotifiedAt: '2026-01-08T11:00:00Z',
    notificationMethod: 'email',
    isAppealed: false,
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
  },
  {
    id: 'sanction-2',
    studentCaseId: 'case-6',
    student: {
      id: 'student-6',
      documentNumber: '1234509876',
      fullName: 'Diego Fernando Castro',
      email: 'diego.castro@email.com',
      programId: 'prog-1',
      programName: 'Tecnología en Desarrollo de Software',
      groupId: 'group-1',
      groupName: 'ADSO-2024-01',
      enrollmentDate: '2024-02-15',
      status: 'suspended',
    },
    type: 'temporary_suspension',
    description: 'Suspensión temporal por 5 días debido a falsificación de documento de justificación.',
    legalBasis: 'Reglamento del Aprendiz, Artículo 18, numeral 2',
    startDate: '2026-01-06',
    endDate: '2026-01-11',
    durationDays: 5,
    status: 'active',
    appliedBy: 'admin-1',
    appliedByName: 'Dr. Juan Pérez',
    appliedAt: '2026-01-06T08:00:00Z',
    studentNotifiedAt: '2026-01-06T09:00:00Z',
    parentNotifiedAt: '2026-01-06T09:30:00Z',
    notificationMethod: 'both',
    isAppealed: true,
    appealId: 'appeal-1',
    createdAt: '2026-01-06T08:00:00Z',
    updatedAt: '2026-01-07T14:00:00Z',
  },
  {
    id: 'sanction-3',
    studentCaseId: 'case-7',
    student: {
      id: 'student-7',
      documentNumber: '5678901234',
      fullName: 'Valentina Torres Mejía',
      email: 'valentina.torres@email.com',
      programId: 'prog-3',
      programName: 'Tecnología en Contabilidad',
      groupId: 'group-4',
      groupName: 'CONT-2024-01',
      enrollmentDate: '2024-01-15',
      status: 'active',
    },
    type: 'verbal_warning',
    description: 'Amonestación verbal por primera inasistencia injustificada.',
    startDate: '2025-12-15',
    status: 'completed',
    appliedBy: 'instructor-1',
    appliedByName: 'María González',
    appliedAt: '2025-12-15T14:00:00Z',
    completedAt: '2025-12-15T14:30:00Z',
    completedBy: 'instructor-1',
    completionNotes: 'El estudiante aceptó la amonestación y se comprometió a mejorar.',
    isAppealed: false,
    createdAt: '2025-12-15T14:00:00Z',
    updatedAt: '2025-12-15T14:30:00Z',
  },
  {
    id: 'sanction-4',
    studentCaseId: 'case-8',
    student: {
      id: 'student-8',
      documentNumber: '3456789012',
      fullName: 'Andrés Felipe Gómez',
      email: 'andres.gomez@email.com',
      programId: 'prog-1',
      programName: 'Tecnología en Desarrollo de Software',
      groupId: 'group-3',
      groupName: 'ADSO-2023-02',
      enrollmentDate: '2023-08-01',
      status: 'active',
    },
    type: 'conditional_enrollment',
    description: 'Matrícula condicional por reincidencia en bajo rendimiento académico.',
    legalBasis: 'Reglamento del Aprendiz, Artículo 12',
    startDate: '2025-11-01',
    endDate: '2026-03-01',
    durationDays: 121,
    status: 'active',
    appliedBy: 'admin-1',
    appliedByName: 'Dr. Juan Pérez',
    appliedAt: '2025-11-01T10:00:00Z',
    studentNotifiedAt: '2025-11-01T12:00:00Z',
    notificationMethod: 'physical',
    isAppealed: false,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T12:00:00Z',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface SanctionCardProps {
  sanction: Sanction;
  onView: () => void;
}

function SanctionCard({ sanction, onView }: SanctionCardProps) {
  const statusConfig = SANCTION_STATUS_CONFIG[sanction.status];
  const typeConfig = SANCTION_TYPE_CONFIG[sanction.type];
  
  const daysRemaining = sanction.endDate 
    ? Math.ceil((new Date(sanction.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            {sanction.isAppealed && (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                <Scale className="w-3 h-3" />
                Apelada
              </span>
            )}
          </div>
          <div className={`p-1.5 rounded-lg bg-gray-100`}>
            <Ban className={`w-4 h-4 ${typeConfig.color}`} />
          </div>
        </div>
        <h3 className="font-semibold text-gray-900">{typeConfig.label}</h3>
        <div className="flex items-center gap-1 mt-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < typeConfig.severity ? 'bg-red-500' : 'bg-gray-200'}`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">Severidad {typeConfig.severity}/6</span>
        </div>
      </div>

      {/* Student */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {sanction.student.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {sanction.student.groupName}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {sanction.description}
        </p>

        {/* Dates */}
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>Inicio: {new Date(sanction.startDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          {sanction.endDate && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>
                Fin: {new Date(sanction.endDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                {sanction.status === 'active' && daysRemaining !== null && (
                  <span className={`ml-1 ${daysRemaining <= 3 ? 'text-orange-600 font-medium' : ''}`}>
                    ({daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Vencida'})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {sanction.studentNotifiedAt && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Bell className="w-3 h-3" />
              Notificado
            </span>
          )}
          {sanction.legalBasis && (
            <span className="flex items-center gap-1 text-xs text-gray-500" title={sanction.legalBasis}>
              <FileText className="w-3 h-3" />
              Base legal
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
        <button
          onClick={onView}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver detalle
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function SancionesContent() {
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SanctionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<SanctionType | 'all'>('all');

  const { setSanctions: setStoreSanctions, openSanctionModal } = useMevalStore();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setSanctions(demoSanctions);
      setStoreSanctions(demoSanctions);
      setIsLoading(false);
    }, 400);
  }, [setStoreSanctions]);

  const filteredSanctions = sanctions.filter((s) => {
    const matchesSearch =
      searchQuery === '' ||
      s.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesType = typeFilter === 'all' || s.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Stats
  const stats = {
    total: sanctions.length,
    active: sanctions.filter(s => s.status === 'active').length,
    pending: sanctions.filter(s => s.status === 'pending').length,
    appealed: sanctions.filter(s => s.isAppealed).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando sanciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/meval" className="hover:text-green-600">Meval</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Sanciones</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sanciones</h1>
          <p className="text-gray-500 mt-1">
            Gestión de sanciones disciplinarias activas e historial
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Ban className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.appealed}</p>
              <p className="text-sm text-gray-500">Apeladas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por estudiante o descripción..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SanctionStatus | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(SANCTION_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as SanctionType | 'all')}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(SANCTION_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredSanctions.length} sancion{filteredSanctions.length !== 1 && 'es'}
      </p>

      {/* Grid */}
      {filteredSanctions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron sanciones</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Intenta ajustar los filtros'
              : 'No hay sanciones registradas'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSanctions.map((sanction) => (
            <SanctionCard
              key={sanction.id}
              sanction={sanction}
              onView={() => console.log('Ver sanción:', sanction.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
