import type { SearchOption } from './searchOptions';

/**
 * Sugerencias predefinidas para SICORA
 */
export const sicoraSearchSuggestions: SearchOption[] = [
  { value: 'users', label: 'Gestión de usuarios', icon: '👥', category: 'Administración' },
  { value: 'schedules', label: 'Programación de horarios', icon: '📅', category: 'Académico' },
  { value: 'attendance', label: 'Control de asistencia', icon: '✅', category: 'Académico' },
  { value: 'evaluations', label: 'Evaluaciones', icon: '📝', category: 'Académico' },
  { value: 'reports', label: 'Reportes institucionales', icon: '📈', category: 'Reportes' },
  { value: 'ai-assistant', label: 'Asistente de IA', icon: '🤖', category: 'Herramientas' },
  { value: 'projects', label: 'Proyectos formativos', icon: '🚀', category: 'Académico' },
  { value: 'competencies', label: 'Competencias', icon: '🎯', category: 'Académico' },
  { value: 'software-factory', label: 'Fábrica de software', icon: '⚡', category: 'Técnico' },
  {
    value: 'environments',
    label: 'Ambientes de formación',
    icon: '🏢',
    category: 'Infraestructura',
  },
];
