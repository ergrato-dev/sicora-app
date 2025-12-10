import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUserStore, demoUser, type User } from './userStore';

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      DEV: true,
    },
  },
});

describe('userStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const { user } = useUserStore.getState();
      expect(user).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const { isAuthenticated } = useUserStore.getState();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and authenticate', () => {
      const testUser: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'instructor',
      };

      useUserStore.getState().setUser(testUser);

      const { user, isAuthenticated } = useUserStore.getState();
      expect(user).toEqual(testUser);
      expect(isAuthenticated).toBe(true);
    });

    it('should set user with all optional fields', () => {
      const testUser: User = {
        id: '456',
        name: 'Full User',
        email: 'full@example.com',
        role: 'admin',
        avatar: 'https://example.com/avatar.png',
        status: 'online',
        coordination: 'IT Department',
        ficha: '2830024',
      };

      useUserStore.getState().setUser(testUser);

      const { user } = useUserStore.getState();
      expect(user?.avatar).toBe('https://example.com/avatar.png');
      expect(user?.status).toBe('online');
      expect(user?.coordination).toBe('IT Department');
      expect(user?.ficha).toBe('2830024');
    });
  });

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      // First, set a user
      useUserStore.getState().setUser(demoUser);
      expect(useUserStore.getState().isAuthenticated).toBe(true);

      // Then logout
      useUserStore.getState().logout();

      const { user, isAuthenticated } = useUserStore.getState();
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status when user exists', () => {
      useUserStore.getState().setUser(demoUser);

      useUserStore.getState().updateUserStatus('busy');

      const { user } = useUserStore.getState();
      expect(user?.status).toBe('busy');
    });

    it('should handle all status types', () => {
      useUserStore.getState().setUser(demoUser);

      const statuses: User['status'][] = ['online', 'offline', 'away', 'busy'];

      statuses.forEach((status) => {
        useUserStore.getState().updateUserStatus(status);
        expect(useUserStore.getState().user?.status).toBe(status);
      });
    });

    it('should not crash when user is null', () => {
      // User is null by default
      expect(() => {
        useUserStore.getState().updateUserStatus('online');
      }).not.toThrow();

      expect(useUserStore.getState().user).toBeNull();
    });
  });

  describe('demoUser', () => {
    it('should have correct demo user properties', () => {
      expect(demoUser.id).toBe('1');
      expect(demoUser.name).toBe('María González Rodríguez');
      expect(demoUser.email).toBe('maria.gonzalez@sena.edu.co');
      expect(demoUser.role).toBe('admin');
      expect(demoUser.status).toBe('online');
    });
  });

  describe('role types', () => {
    it('should accept all valid role types', () => {
      const roles: User['role'][] = [
        'admin',
        'instructor',
        'aprendiz',
        'coordinador',
        'administrativo',
      ];

      roles.forEach((role) => {
        const testUser: User = {
          id: '1',
          name: 'Test',
          email: 'test@test.com',
          role,
        };

        useUserStore.getState().setUser(testUser);
        expect(useUserStore.getState().user?.role).toBe(role);
      });
    });
  });
});
