import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getToken, setToken, clearToken } from '../auth-storage';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('auth-storage', () => {
  beforeEach(() => localStorageMock.clear());

  it('getToken returns null when nothing stored', () => {
    expect(getToken()).toBeNull();
  });

  it('setToken stores the token', () => {
    setToken('my-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('courier_token', 'my-token');
  });

  it('getToken returns the stored token', () => {
    setToken('tok123');
    localStorageMock.getItem.mockReturnValueOnce('tok123');
    expect(getToken()).toBe('tok123');
  });

  it('clearToken removes the token', () => {
    setToken('tok');
    clearToken();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('courier_token');
  });
});
