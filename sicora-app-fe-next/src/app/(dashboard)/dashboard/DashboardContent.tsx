'use client';

import {
  Users,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * DashboardContent - Contenido del dashboard (Client Component)
 * Muestra métricas, gráficos y actividad reciente
 */

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                changeType === 'positive' && 'text-green-600',
                changeType === 'negative' && 'text-red-600',
                changeType === 'neutral' && 'text-gray-500'
              )}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-sena-primary-50 rounded-lg">
          <Icon className="w-6 h-6 text-sena-primary-600" />
        </div>
      </div>
    </div>
  );
}

interface ActivityItem {
  id: string;
  type: 'user' | 'schedule' | 'evaluation' | 'alert';
  message: string;
  time: string;
}

const recentActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'user',
    message: 'Nuevo usuario registrado: Juan Pérez',
    time: 'Hace 5 min',
  },
  {
    id: '2',
    type: 'schedule',
    message: 'Horario actualizado para Ficha #2847392',
    time: 'Hace 15 min',
  },
  {
    id: '3',
    type: 'evaluation',
    message: 'Evaluación completada: Desarrollo Web',
    time: 'Hace 1 hora',
  },
  {
    id: '4',
    type: 'alert',
    message: 'Conflicto de horario detectado en Ambiente 301',
    time: 'Hace 2 horas',
  },
  {
    id: '5',
    type: 'user',
    message: 'Instructor asignado: María García',
    time: 'Hace 3 horas',
  },
];

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  switch (type) {
    case 'user':
      return <Users className="w-4 h-4 text-blue-600" />;
    case 'schedule':
      return <Calendar className="w-4 h-4 text-green-600" />;
    case 'evaluation':
      return <ClipboardCheck className="w-4 h-4 text-purple-600" />;
    case 'alert':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
  }
}

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Bienvenido al Sistema de Coordinación Académica
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuarios Activos"
          value={1247}
          change="+12% este mes"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Horarios Programados"
          value={342}
          change="18 pendientes"
          changeType="neutral"
          icon={Calendar}
        />
        <StatCard
          title="Evaluaciones"
          value={89}
          change="+5 esta semana"
          changeType="positive"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Tasa de Asistencia"
          value="94.2%"
          change="+2.1% vs anterior"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad Reciente */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Actividad Reciente
            </h2>
            <button className="text-sm text-sena-primary-600 hover:text-sena-primary-700 font-medium">
              Ver todo
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ActivityIcon type={item.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{item.message}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>

          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-sena-primary-50 text-sena-primary-700 hover:bg-sena-primary-100 transition-colors">
              <Users className="w-5 h-5" />
              <span className="font-medium">Nuevo Usuario</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Crear Horario</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
              <ClipboardCheck className="w-5 h-5" />
              <span className="font-medium">Nueva Evaluación</span>
            </button>
          </div>

          {/* Info card */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900">
              Próxima Actualización
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Migración a Next.js en progreso. Nuevas funcionalidades
              disponibles próximamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
