import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Mock AuthContext
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/features/auth/AuthContext';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

function renderWithRouter(ui: React.ReactElement, initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/protected" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state while isLoading is true', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });
    renderWithRouter(<ProtectedRoute><div>Secret</div></ProtectedRoute>);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    renderWithRouter(<ProtectedRoute><div>Secret</div></ProtectedRoute>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', role: 'USER', fullName: 'Test' },
      isLoading: false,
    });
    renderWithRouter(<ProtectedRoute><div>Secret Content</div></ProtectedRoute>);
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  it('redirects to /dashboard when role requirement is not met', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', role: 'USER' },
      isLoading: false,
    });
    renderWithRouter(
      <ProtectedRoute requiredRole="ADMIN"><div>Admin Only</div></ProtectedRoute>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });

  it('renders children when role requirement is satisfied', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'a1', role: 'ADMIN' },
      isLoading: false,
    });
    renderWithRouter(
      <ProtectedRoute requiredRole="ADMIN"><div>Admin Content</div></ProtectedRoute>,
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
