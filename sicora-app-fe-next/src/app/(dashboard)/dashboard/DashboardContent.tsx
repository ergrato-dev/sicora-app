'use client';

import {
  Users,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  Clock,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';
import { TodayScheduleWidget, AttendanceSummaryWidget } from '@/components/dashboard';
import type { TodaySchedule, StudentAttendanceSummary, InstructorAttendanceSummary, GlobalAttendanceSummary } from '@/types/dashboard.types';

/**
 * DashboardContent - Contenido del dashboard dinámico por rol
 * Muestra diferentes widgets según el rol del usuario
 */

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

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

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  primary?: boolean;
}

function QuickAction({ icon: Icon, label, primary }: QuickActionProps) {
  return (
    <button
      className={cn(
        'w-full flex items-center justify-between gap-3 p-3 rounded-lg transition-colors',
        primary
          ? 'bg-sena-primary-50 text-sena-primary-700 hover:bg-sena-primary-100'
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-50" />
    </button>
  );
}

// ============================================================================
// DATOS MOCK (Temporales hasta conectar con API)
// ============================================================================

const mockStudentSchedules: TodaySchedule[] = [
  {
    id: '1',
    subject: 'Desarrollo Web Frontend',
    instructor_name: 'María García López',
    venue_name: 'Ambiente TIC 301',
    venue_code: 'TIC-301',
    start_time: '07:00',
    end_time: '10:00',
    ficha: '2847392',
    status: 'completed',
  },
  {
    id: '2',
    subject: 'Base de Datos',
    instructor_name: 'Carlos Rodríguez',
    venue_name: 'Ambiente TIC 302',
    venue_code: 'TIC-302',
    start_time: '10:00',
    end_time: '13:00',
    ficha: '2847392',
    status: 'in_progress',
  },
  {
    id: '3',
    subject: 'Inglés Técnico',
    instructor_name: 'Ana Martínez',
    venue_name: 'Aula 205',
    venue_code: 'A-205',
    start_time: '14:00',
    end_time: '16:00',
    ficha: '2847392',
    status: 'upcoming',
  },
];

const mockStudentAttendance: StudentAttendanceSummary = {
  total_classes: 45,
  attended: 42,
  absences: 2,
  late: 1,
  justified: 1,
  attendance_rate: 93.3,
  streak_days: 12,
  pending_justifications: 1,
};

const mockInstructorAttendance: InstructorAttendanceSummary = {
  total_students: 156,
  present_today: 142,
  absent_today: 8,
  late_today: 6,
  average_rate: 91.2,
  trend: 2.3,
  classes_today: 4,
  pending_attendance: 1,
};

const mockGlobalAttendance: GlobalAttendanceSummary = {
  global_rate: 89.5,
  trend: 1.8,
  active_students: 3247,
  total_groups: 87,
  critical_groups: 3,
  on_time_rate: 78,
  late_rate: 12,
  absence_rate: 10,
  total_records_today: 2891,
  attendance_rate_today: 91.2,
  attendance_rate_week: 89.5,
  attendance_rate_month: 88.3,
  trend_direction: 'up',
  by_coordination: [],
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function DashboardContent() {
  const { user } = useAuthStore();
  const role = user?.role || 'aprendiz';

  // Saludo personalizado según hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Renderizar dashboard según rol
  if (role === 'aprendiz') {
    return <StudentDashboard userName={user?.name || 'Aprendiz'} greeting={getGreeting()} />;
  }

  if (role === 'instructor') {
    return <InstructorDashboard userName={user?.name || 'Instructor'} greeting={getGreeting()} />;
  }

  // Admin, Coordinador, Administrativo
  return <AdminDashboard userName={user?.name || 'Usuario'} greeting={getGreeting()} role={role} />;
}

// ============================================================================
// DASHBOARD DE APRENDIZ
// ============================================================================

interface StudentDashboardProps {
  userName: string;
  greeting: string;
}

function StudentDashboard({ userName, greeting }: StudentDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {userName.split(' ')[0]}!</h1>
        <p className="mt-1 text-gray-500">
          Aquí está el resumen de tu día académico
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Asistencia"
          value="93%"
          change="+2% este mes"
          changeType="positive"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Clases Hoy"
          value={3}
          icon={Calendar}
        />
        <StatCard
          title="Racha"
          value="12 días"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Pendientes"
          value={1}
          change="justificación"
          changeType="negative"
          icon={AlertCircle}
        />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayScheduleWidget schedules={mockStudentSchedules} />
        <AttendanceSummaryWidget data={mockStudentAttendance} role="aprendiz" />
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction icon={BookOpen} label="Ver mi Código QR" primary />
          <QuickAction icon={ClipboardCheck} label="Enviar Justificación" />
          <QuickAction icon={Calendar} label="Ver Horario Completo" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD DE INSTRUCTOR
// ============================================================================

interface InstructorDashboardProps {
  userName: string;
  greeting: string;
}

function InstructorDashboard({ userName, greeting }: InstructorDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {userName.split(' ')[0]}!</h1>
        <p className="mt-1 text-gray-500">
          Resumen de tus grupos y clases de hoy
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Estudiantes"
          value={156}
          change="En 4 fichas"
          icon={GraduationCap}
        />
        <StatCard
          title="Clases Hoy"
          value={4}
          change="1 completada"
          icon={Calendar}
        />
        <StatCard
          title="Asistencia Hoy"
          value="91%"
          change="+2.3% vs ayer"
          changeType="positive"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Pendientes"
          value={1}
          change="Por registrar"
          changeType="negative"
          icon={AlertCircle}
        />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayScheduleWidget schedules={mockStudentSchedules} />
        <AttendanceSummaryWidget data={mockInstructorAttendance} role="instructor" />
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction icon={ClipboardCheck} label="Tomar Asistencia" primary />
          <QuickAction icon={Users} label="Ver mis Fichas" />
          <QuickAction icon={Bell} label="Ver Justificaciones" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD DE ADMIN/COORDINADOR
// ============================================================================

interface AdminDashboardProps {
  userName: string;
  greeting: string;
  role: string;
}

function AdminDashboard({ userName, greeting, role }: AdminDashboardProps) {
  const roleLabel = role === 'admin' ? 'Administrador' : role === 'coordinador' ? 'Coordinador' : 'Usuario';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {userName.split(' ')[0]}!</h1>
          <p className="mt-1 text-gray-500">
            Panel de {roleLabel} - Vista general del sistema
          </p>
        </div>
        <span className="px-3 py-1 bg-sena-primary-100 text-sena-primary-700 rounded-full text-sm font-medium">
          {roleLabel}
        </span>
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
          value="89.5%"
          change="+1.8% vs anterior"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asistencia Global */}
        <div className="lg:col-span-2">
          <AttendanceSummaryWidget data={mockGlobalAttendance} role="admin" />
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <QuickAction icon={Users} label="Gestionar Usuarios" primary />
            <QuickAction icon={Calendar} label="Ver Horarios" />
            <QuickAction icon={ClipboardCheck} label="Reportes de Asistencia" />
            <QuickAction icon={AlertCircle} label="Ver Alertas" />
            <QuickAction icon={Bell} label="Justificaciones Pendientes" />
          </div>
        </div>
      </div>

      {/* Alertas del sistema */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Alertas del Sistema</h3>
          <button className="text-sm text-sena-primary-600 hover:text-sena-primary-700 font-medium">
            Ver todas
          </button>
        </div>
        <div className="space-y-3">
          <AlertItem
            type="warning"
            message="3 grupos con asistencia crítica (<60%)"
            time="Actualizado hace 5 min"
          />
          <AlertItem
            type="info"
            message="15 justificaciones pendientes de revisión"
            time="12 nuevas hoy"
          />
          <AlertItem
            type="success"
            message="Tasa de asistencia global mejoró 1.8% esta semana"
            time="Tendencia positiva"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES DE ALERTAS
// ============================================================================

interface AlertItemProps {
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  time: string;
}

function AlertItem({ type, message, time }: AlertItemProps) {
  const config = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Bell,
      iconColor: 'text-blue-600',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: TrendingUp,
      iconColor: 'text-green-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border', config.bg, config.border)}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {time}
        </p>
      </div>
    </div>
  );
}
