import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, type User } from './auth-store';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('auth-store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      token: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('should have null token initially', () => {
      const { token } = useAuthStore.getState();
      expect(token).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should set user, token and authenticate', () => {
      const testUser: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'instructor',
      };
      const testToken = 'jwt-token-123';

      useAuthStore.getState().login(testUser, testToken);

      const { user, token, isAuthenticated } = useAuthStore.getState();
      expect(user).toEqual(testUser);
      expect(token).toBe(testToken);
      expect(isAuthenticated).toBe(true);
    });

    it('should overwrite previous session on new login', () => {
      const user1: User = { id: '1', name: 'User 1', email: 'u1@test.com', role: 'admin' };
      const user2: User = { id: '2', name: 'User 2', email: 'u2@test.com', role: 'instructor' };

      useAuthStore.getState().login(user1, 'token1');
      useAuthStore.getState().login(user2, 'token2');

      const { user, token } = useAuthStore.getState();
      expect(user?.id).toBe('2');
      expect(token).toBe('token2');
    });
  });

  describe('logout', () => {
    it('should clear user, token and set isAuthenticated to false', () => {
      const testUser: User = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      };

      // First login
      useAuthStore.getState().login(testUser, 'test-token');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Then logout
      useAuthStore.getState().logout();

      const { user, token, isAuthenticated } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(token).toBeNull();
      expect(isAuthenticated).toBe(false);
    });

    it('should call localStorage.removeItem', () => {
      useAuthStore.getState().logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-storage');
    });
  });

  describe('setUser', () => {
    it('should update user without affecting token', () => {
      const initialUser: User = { id: '1', name: 'Initial', email: 'i@test.com', role: 'admin' };
      useAuthStore.getState().login(initialUser, 'my-token');

      const updatedUser: User = {
        id: '1',
        name: 'Updated',
        email: 'u@test.com',
        role: 'coordinador',
      };
      useAuthStore.getState().setUser(updatedUser);

      const { user, token } = useAuthStore.getState();
      expect(user?.name).toBe('Updated');
      expect(user?.role).toBe('coordinador');
      expect(token).toBe('my-token'); // Token unchanged
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status when user exists', () => {
      const testUser: User = { id: '1', name: 'Test', email: 't@test.com', role: 'admin' };
      useAuthStore.getState().login(testUser, 'token');

      useAuthStore.getState().updateUserStatus('busy');

      expect(useAuthStore.getState().user?.status).toBe('busy');
    });

    it('should handle all status types', () => {
      const testUser: User = { id: '1', name: 'Test', email: 't@test.com', role: 'admin' };
      useAuthStore.getState().login(testUser, 'token');

      const statuses: User['status'][] = ['online', 'offline', 'away', 'busy'];

      statuses.forEach((status) => {
        useAuthStore.getState().updateUserStatus(status);
        expect(useAuthStore.getState().user?.status).toBe(status);
      });
    });

    it('should not update when user is null', () => {
      useAuthStore.getState().updateUserStatus('online');
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
