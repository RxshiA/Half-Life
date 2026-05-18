import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => vi.fn() };
});

import { useAuth } from '@/features/auth/AuthContext';

const mockLogin = vi.fn();

import { RegisterPage } from '../RegisterPage';

function renderRegister() {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ login: mockLogin });
  return render(<MemoryRouter><RegisterPage /></MemoryRouter>);
}

describe('RegisterPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all required form fields', () => {
    renderRegister();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation error for short full name', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/full name/i), 'A');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() =>
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument(),
    );
  });

  it('shows validation error for weak password', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/password/i), 'weak');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() =>
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument(),
    );
  });

  it('submits successfully with valid data (MSW handler)', async () => {
    renderRegister();
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password1');
    await userEvent.type(screen.getByLabelText(/phone/i), '+61400000001');
    await userEvent.type(screen.getByLabelText(/address/i), '1 Test Street');
    await userEvent.type(screen.getByLabelText(/city/i), 'Sydney');
    await userEvent.type(screen.getByLabelText(/state/i), 'NSW');
    await userEvent.type(screen.getByLabelText(/postal/i), '2000');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalled(), { timeout: 3000 });
  });
});
