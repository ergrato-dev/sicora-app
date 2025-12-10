import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBreadcrumb } from './useBreadcrumb';

describe('useBreadcrumb', () => {
  describe('initial breadcrumb', () => {
    it('should always include Inicio as first breadcrumb', () => {
      const { result } = renderHook(() => useBreadcrumb('/dashboard'));
      const { breadcrumbs } = result.current;

      expect(breadcrumbs[0]).toEqual({
        label: 'Inicio',
        href: '/dashboard',
        icon: '📊',
      });
    });
  });

  describe('path parsing', () => {
    it('should parse single segment path', () => {
      const { result } = renderHook(() => useBreadcrumb('/usuarios'));
      const { breadcrumbs } = result.current;

      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[1]).toMatchObject({
        label: 'Usuarios',
        href: '/usuarios',
        active: true,
      });
    });

    it('should parse multi-segment path', () => {
      const { result } = renderHook(() => useBreadcrumb('/usuarios/crear'));
      const { breadcrumbs } = result.current;

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[1]).toMatchObject({ label: 'Usuarios', href: '/usuarios' });
      expect(breadcrumbs[2]).toMatchObject({
        label: 'Crear',
        href: '/usuarios/crear',
        active: true,
      });
    });

    it('should handle empty path', () => {
      const { result } = renderHook(() => useBreadcrumb('/'));
      const { breadcrumbs } = result.current;

      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].label).toBe('Inicio');
    });
  });

  describe('route labels', () => {
    it.each([
      ['/dashboard', 'Dashboard'],
      ['/usuarios', 'Usuarios'],
      ['/horarios', 'Horarios'],
      ['/evaluaciones', 'Evaluaciones'],
      ['/proyectos', 'Proyectos'],
      ['/competencias', 'Competencias'],
      ['/reportes', 'Reportes'],
      ['/configuracion', 'Configuración'],
      ['/perfil', 'Mi Perfil'],
      ['/fichas', 'Fichas'],
      ['/instructores', 'Instructores'],
      ['/aprendices', 'Aprendices'],
      ['/ambientes', 'Ambientes'],
      ['/asistencia', 'Asistencia'],
    ])('should map %s to label %s', (path, expectedLabel) => {
      const { result } = renderHook(() => useBreadcrumb(path));
      const { breadcrumbs } = result.current;

      expect(breadcrumbs[1].label).toBe(expectedLabel);
    });

    it('should capitalize unknown routes', () => {
      const { result } = renderHook(() => useBreadcrumb('/unknown'));
      const { breadcrumbs } = result.current;

      expect(breadcrumbs[1].label).toBe('Unknown');
    });
  });

  describe('route icons', () => {
    it('should assign correct icons to known routes', () => {
      const { result } = renderHook(() => useBreadcrumb('/usuarios'));
      expect(result.current.breadcrumbs[1].icon).toBe('👥');
    });

    it('should use default icon for unknown routes', () => {
      const { result } = renderHook(() => useBreadcrumb('/custom'));
      expect(result.current.breadcrumbs[1].icon).toBe('📄');
    });
  });

  describe('active state', () => {
    it('should mark only the last breadcrumb as active', () => {
      const { result } = renderHook(() => useBreadcrumb('/usuarios/crear/detalle'));
      const { breadcrumbs } = result.current;

      expect(breadcrumbs[1].active).toBeFalsy();
      expect(breadcrumbs[2].active).toBeFalsy();
      expect(breadcrumbs[3].active).toBe(true);
    });
  });

  describe('generateBreadcrumbs function', () => {
    it('should be exposed for manual generation', () => {
      const { result } = renderHook(() => useBreadcrumb('/dashboard'));
      const { generateBreadcrumbs } = result.current;

      const customBreadcrumbs = generateBreadcrumbs('/reportes/crear');
      expect(customBreadcrumbs).toHaveLength(3);
      expect(customBreadcrumbs[1].label).toBe('Reportes');
      expect(customBreadcrumbs[2].label).toBe('Crear');
    });
  });
});
