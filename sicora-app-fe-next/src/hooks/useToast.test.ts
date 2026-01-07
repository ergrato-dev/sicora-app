import { describe, it, expect, beforeEach } from 'vitest';
import { reducer } from './useToast';

// Test the reducer directly since it's exported
// useToast hook uses global state which makes it harder to test in isolation

interface ToasterToast {
  id: string;
  title?: string;
  description?: string;
  open?: boolean;
}

interface State {
  toasts: ToasterToast[];
}

describe('useToast reducer', () => {
  let initialState: State;

  beforeEach(() => {
    initialState = { toasts: [] };
  });

  describe('ADD_TOAST', () => {
    it('should add a toast to empty state', () => {
      const toast: ToasterToast = { id: '1', title: 'Test Toast' };
      const action = { type: 'ADD_TOAST' as const, toast };

      const result = reducer(initialState, action);

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].title).toBe('Test Toast');
    });

    it('should add toast at the beginning (new toast replaces due to TOAST_LIMIT=1)', () => {
      const state: State = { toasts: [{ id: '1', title: 'First' }] };
      const newToast: ToasterToast = { id: '2', title: 'Second' };
      const action = { type: 'ADD_TOAST' as const, toast: newToast };

      const result = reducer(state, action);

      // Since TOAST_LIMIT=1, new toast is at position 0 and old one is removed
      expect(result.toasts[0].id).toBe('2');
      expect(result.toasts).toHaveLength(1);
    });

    it('should limit toasts to TOAST_LIMIT (1)', () => {
      const state: State = { toasts: [{ id: '1', title: 'First' }] };
      const newToast: ToasterToast = { id: '2', title: 'Second' };
      const action = { type: 'ADD_TOAST' as const, toast: newToast };

      const result = reducer(state, action);

      // TOAST_LIMIT is 1, so only the new toast should remain
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('2');
    });
  });

  describe('UPDATE_TOAST', () => {
    it('should update existing toast', () => {
      const state: State = { toasts: [{ id: '1', title: 'Original' }] };
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '1', title: 'Updated' },
      };

      const result = reducer(state, action);

      expect(result.toasts[0].title).toBe('Updated');
    });

    it('should not affect other toasts', () => {
      const state: State = {
        toasts: [
          { id: '1', title: 'First' },
          { id: '2', title: 'Second' },
        ],
      };
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '1', title: 'Updated' },
      };

      const result = reducer(state, action);

      expect(result.toasts[1].title).toBe('Second');
    });

    it('should merge partial updates', () => {
      const state: State = { toasts: [{ id: '1', title: 'Title', description: 'Desc' }] };
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '1', description: 'New Desc' },
      };

      const result = reducer(state, action);

      expect(result.toasts[0].title).toBe('Title');
      expect(result.toasts[0].description).toBe('New Desc');
    });
  });

  describe('DISMISS_TOAST', () => {
    it('should set open to false for specific toast', () => {
      const state: State = { toasts: [{ id: '1', open: true }] };
      const action = { type: 'DISMISS_TOAST' as const, toastId: '1' };

      const result = reducer(state, action);

      expect(result.toasts[0].open).toBe(false);
    });

    it('should dismiss all toasts when no id provided', () => {
      const state: State = {
        toasts: [
          { id: '1', open: true },
          { id: '2', open: true },
        ],
      };
      const action = { type: 'DISMISS_TOAST' as const, toastId: undefined };

      const result = reducer(state, action);

      expect(result.toasts.every((t) => t.open === false)).toBe(true);
    });
  });

  describe('REMOVE_TOAST', () => {
    it('should remove specific toast by id', () => {
      const state: State = {
        toasts: [
          { id: '1', title: 'First' },
          { id: '2', title: 'Second' },
        ],
      };
      const action = { type: 'REMOVE_TOAST' as const, toastId: '1' };

      const result = reducer(state, action);

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe('2');
    });

    it('should remove all toasts when no id provided', () => {
      const state: State = {
        toasts: [
          { id: '1', title: 'First' },
          { id: '2', title: 'Second' },
        ],
      };
      const action = { type: 'REMOVE_TOAST' as const, toastId: undefined };

      const result = reducer(state, action);

      expect(result.toasts).toHaveLength(0);
    });
  });
});
