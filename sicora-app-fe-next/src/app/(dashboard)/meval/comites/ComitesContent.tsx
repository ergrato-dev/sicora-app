'use client';

/**
 * Página de Comités Evaluadores - MevalService
 * Gestión de comités disciplinarios, académicos y de bienestar
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Users,
  Scale,
  BookOpen,
  Heart,
  Star,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  Building2,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useMevalStore } from '@/stores/mevalStore';
import type { Committee, CommitteeType, CommitteeMember } from '@/types/meval.types';
import { COMMITTEE_TYPE_CONFIG } from '@/types/meval.types';

// ============================================================================
// DATOS DE DEMOSTRACIÓN
// ============================================================================

const demoCommittees: Committee[] = [
  {
    id: 'committee-1',
    name: 'Comité Disciplinario - Centro Principal',
    type: 'disciplinary',
    description: 'Comité encargado de evaluar faltas disciplinarias de los aprendices del centro principal.',
    centerId: 'center-1',
    centerName: 'Sede Formación Principal',
    members: [
      { id: 'm1', userId: 'user-1', name: 'Dr. Juan Pérez', email: 'juan@email.com', role: 'president', position: 'Subdirector', isActive: true, joinedAt: '2024-01-15' },
      { id: 'm2', userId: 'user-2', name: 'María González', email: 'maria@email.com', role: 'secretary', position: 'Coordinadora Académica', isActive: true, joinedAt: '2024-01-15' },
      { id: 'm3', userId: 'user-3', name: 'Carlos Rodríguez', email: 'carlos@email.com', role: 'member', position: 'Instructor Líder', isActive: true, joinedAt: '2024-02-01' },
      { id: 'm4', userId: 'user-4', name: 'Ana Martínez', email: 'ana@email.com', role: 'member', position: 'Psicóloga', isActive: true, joinedAt: '2024-02-01' },
    ],
    meetingSchedule: 'Jueves 14:00 - 16:00',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-12-01T08:00:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'committee-2',
    name: 'Comité Académico - Tecnologías',
    type: 'academic',
    description: 'Comité para revisión de casos académicos de programas de tecnología.',
    centerId: 'center-1',
    centerName: 'Sede Formación Principal',
    members: [
      { id: 'm5', userId: 'user-5', name: 'Dra. Laura Sánchez', email: 'laura@email.com', role: 'president', position: 'Coordinadora de Formación', isActive: true, joinedAt: '2024-03-01' },
      { id: 'm6', userId: 'user-6', name: 'Roberto Díaz', email: 'roberto@email.com', role: 'secretary', position: 'Instructor', isActive: true, joinedAt: '2024-03-01' },
      { id: 'm7', userId: 'user-7', name: 'Sandra López', email: 'sandra@email.com', role: 'member', position: 'Instructora', isActive: true, joinedAt: '2024-03-15' },
    ],
    meetingSchedule: 'Martes 10:00 - 12:00',
    isActive: true,
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2025-11-15T14:00:00Z',
    createdBy: 'admin-1',
  },
  {
    id: 'committee-3',
    name: 'Comité de Bienestar',
    type: 'welfare',
    description: 'Comité para evaluación de situaciones de bienestar y apoyo a aprendices.',
    centerId: 'center-1',
    centerName: 'Sede Formación Principal',
    members: [
      { id: 'm8', userId: 'user-8', name: 'Patricia Vargas', email: 'patricia@email.com', role: 'president', position: 'Líder de Bienestar', isActive: true, joinedAt: '2024-01-20' },
      { id: 'm9', userId: 'user-9', name: 'Miguel Torres', email: 'miguel@email.com', role: 'member', position: 'Psicólogo', isActive: true, joinedAt: '2024-01-20' },
    ],
    meetingSchedule: 'Viernes 09:00 - 11:00',
    isActive: true,
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2025-10-20T16:00:00Z',
    createdBy: 'admin-1',
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const typeIcons: Record<CommitteeType, React.ElementType> = {
  disciplinary: Scale,
  academic: BookOpen,
  welfare: Heart,
  special: Star,
};

interface CommitteeCardProps {
  committee: Committee;
  onEdit: () => void;
  onManageMembers: () => void;
}

function CommitteeCard({ committee, onEdit, onManageMembers }: CommitteeCardProps) {
  const typeConfig = COMMITTEE_TYPE_CONFIG[committee.type];
  const TypeIcon = typeIcons[committee.type];
  const [showMenu, setShowMenu] = useState(false);

  const roleLabels: Record<string, string> = {
    president: 'Presidente',
    secretary: 'Secretario',
    member: 'Miembro',
    guest: 'Invitado',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${committee.type === 'disciplinary' ? 'bg-red-100' : committee.type === 'academic' ? 'bg-blue-100' : committee.type === 'welfare' ? 'bg-green-100' : 'bg-purple-100'}`}>
              <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{committee.name}</h3>
              <span className={`text-xs font-medium ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => { onManageMembers(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Gestionar Miembros
                </button>
              </div>
            )}
          </div>
        </div>
        {committee.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {committee.description}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="w-4 h-4" />
          <span>{committee.centerName}</span>
        </div>
        {committee.meetingSchedule && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{committee.meetingSchedule}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs rounded-full ${committee.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {committee.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Members */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Miembros ({committee.members.length})
          </span>
        </div>
        <div className="space-y-2">
          {committee.members.slice(0, 3).map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{member.name}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${
                member.role === 'president' ? 'bg-yellow-100 text-yellow-700' :
                member.role === 'secretary' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {roleLabels[member.role]}
              </span>
            </div>
          ))}
          {committee.members.length > 3 && (
            <p className="text-xs text-gray-400 text-center">
              +{committee.members.length - 3} más
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ComitesContent() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CommitteeType | 'all'>('all');

  const { setCommittees: setStoreCommittees, openCommitteeModal } = useMevalStore();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCommittees(demoCommittees);
      setStoreCommittees(demoCommittees);
      setIsLoading(false);
    }, 400);
  }, [setStoreCommittees]);

  const filteredCommittees = committees.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || c.type === typeFilter;

    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Cargando comités...</p>
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
            <span>Comités</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Comités Evaluadores</h1>
          <p className="text-gray-500 mt-1">
            Gestión de comités disciplinarios, académicos y de bienestar
          </p>
        </div>
        <button
          onClick={openCommitteeModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Comité
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            typeFilter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {Object.entries(COMMITTEE_TYPE_CONFIG).map(([key, config]) => {
          const Icon = typeIcons[key as CommitteeType];
          return (
            <button
              key={key}
              onClick={() => setTypeFilter(key as CommitteeType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                typeFilter === key
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar comités..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredCommittees.length} comité{filteredCommittees.length !== 1 && 's'}
      </p>

      {/* Grid */}
      {filteredCommittees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron comités</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || typeFilter !== 'all'
              ? 'Intenta ajustar los filtros'
              : 'No hay comités registrados'}
          </p>
          <button
            onClick={openCommitteeModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Crear comité
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommittees.map((committee) => (
            <CommitteeCard
              key={committee.id}
              committee={committee}
              onEdit={() => console.log('Editar:', committee.id)}
              onManageMembers={() => console.log('Gestionar miembros:', committee.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
