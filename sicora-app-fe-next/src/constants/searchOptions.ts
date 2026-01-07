/**
 * Constantes de opciones de búsqueda para componentes
 */

export interface SearchOption {
  value: string;
  label: string;
  category: string;
  description?: string;
  icon?: string;
  href?: string;
}

export const sicoraSearchSuggestions: SearchOption[] = [
  // Usuarios y Personas
  {
    value: 'instructor',
    label: 'Buscar instructor',
    category: 'Usuarios',
    icon: '👨‍🏫',
    href: '/users/instructors',
  },
  {
    value: 'aprendiz',
    label: 'Buscar aprendiz',
    category: 'Usuarios',
    icon: '🎓',
    href: '/users/aprendices',
  },
  {
    value: 'coordinador',
    label: 'Buscar coordinador',
    category: 'Usuarios',
    icon: '📋',
    href: '/users/coordinadores',
  },
  {
    value: 'users',
    label: 'Gestión de usuarios',
    category: 'Usuarios',
    icon: '👥',
    href: '/users',
  },

  // Académico
  {
    value: 'schedules',
    label: 'Horarios de clase',
    category: 'Académico',
    icon: '📅',
    href: '/academic/schedules',
  },
  {
    value: 'fichas',
    label: 'Fichas de formación',
    category: 'Académico',
    icon: '📋',
    href: '/academic/fichas',
  },
  {
    value: 'programs',
    label: 'Programas de formación',
    category: 'Académico',
    icon: '🎯',
    href: '/academic/programs',
  },
  {
    value: 'attendance',
    label: 'Asistencia',
    category: 'Académico',
    icon: '✅',
    href: '/academic/attendance',
  },

  // Evaluaciones
  {
    value: 'eval-projects',
    label: 'Evaluación de proyectos',
    category: 'Evaluaciones',
    icon: '📊',
    href: '/evaluations/projects',
  },
  {
    value: 'eval-instructors',
    label: 'Evaluación de instructores',
    category: 'Evaluaciones',
    icon: '⭐',
    href: '/evaluations/instructors',
  },
  {
    value: 'eval-create',
    label: 'Crear evaluación',
    category: 'Evaluaciones',
    icon: '➕',
    href: '/evaluations/create',
  },
  {
    value: 'eval-reports',
    label: 'Reportes de evaluación',
    category: 'Evaluaciones',
    icon: '📈',
    href: '/evaluations/reports',
  },
];
