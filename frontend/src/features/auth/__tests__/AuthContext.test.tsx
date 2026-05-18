import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authStorage from '@/lib/auth-storage';
import * as authApiModule from '../api';

vi.mock('@/lib/auth-storage', () => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

vi.mock('../api', () => ({
  authApi: {
    me: vi.fn(),
  },
}));

const mockGetToken = authStorage.getToken as ReturnType<typeof vi.fn>;
const mockSetToken = authStorage.setToken as ReturnType<typeof vi.fn>;
const mockClearToken = authStorage.clearToken as ReturnType<typeof vi.fn>;
const mockMe = (authApiModule.authApi.me as ReturnType<typeof vi.fn>);

const mockUser = {
  id: 'u1',
  email: 'test@example.com',
  fullName: 'Test User',
  phone: '+61',
  addressLine1: '1 St',
  city: 'Sydney',
  state: 'NSW',
  postalCode: '2000',
  country: 'AU',
  role: 'USER' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function TestConsumer() {
  const { user, isLoading, login, logout } = useAuth();
  return (
    <div>
      {isLoading && <span>Loading…</span>}
      {user && <span>Logged in as {user.fullName}</span>}
      {!user && !isLoading && <span>Not logged in</span>}
      <button onClick={() => login('tok', mockUser)}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(null);
  });

  it('starts with isLoading=true and resolves to not logged in when no token', async () => {
    mockGetToken.mockReturnValue(null);
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument());
    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  it('resolves user from stored token on mount', async () => {
    mockGetToken.mockReturnValue('stored-token');
    mockMe.mockResolvedValue(mockUser);
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByText(`Logged in as ${mockUser.fullName}`)).toBeInTheDocument());
  });

  it('clears token when me() call fails', async () => {
    mockGetToken.mockReturnValue('bad-token');
    mockMe.mockRejectedValue(new Error('Unauthorized'));
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('Not logged in')).toBeInTheDocument());
    expect(mockClearToken).toHaveBeenCalled();
  });

  it('login() sets user and token', async () => {
    mockGetToken.mockReturnValue(null);
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('Not logged in')).toBeInTheDocument());

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    expect(screen.getByText(`Logged in as ${mockUser.fullName}`)).toBeInTheDocument();
    expect(mockSetToken).toHaveBeenCalledWith('tok');
  });

  it('logout() clears user and token', async () => {
    mockGetToken.mockReturnValue('token');
    mockMe.mockResolvedValue(mockUser);
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByText(`Logged in as ${mockUser.fullName}`)).toBeInTheDocument());

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
    expect(mockClearToken).toHaveBeenCalled();
  });
});
