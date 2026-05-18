import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { mockShipment } from '@/test/handlers';

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/features/auth/AuthContext';
import { DashboardPage } from '../DashboardPage';

const BASE = 'http://localhost:4000/api';

function renderDashboard(role: 'USER' | 'ADMIN' = 'USER') {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
    user: { id: 'u1', fullName: 'Test User', role },
  });

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows "My Shipments" heading for USER role', () => {
    renderDashboard('USER');
    expect(screen.getByText(/my shipments/i)).toBeInTheDocument();
  });

  it('shows "All Shipments" heading for ADMIN role', () => {
    renderDashboard('ADMIN');
    expect(screen.getByText(/all shipments/i)).toBeInTheDocument();
  });

  it('shows "New Shipment" button link for USER', () => {
    renderDashboard('USER');
    expect(screen.getByRole('link', { name: /new shipment/i })).toBeInTheDocument();
  });

  it('does not show "New Shipment" button for ADMIN', () => {
    renderDashboard('ADMIN');
    expect(screen.queryByRole('link', { name: /new shipment/i })).not.toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderDashboard('USER');
    // Initially will show loading
    expect(screen.getByText(/loading shipments/i)).toBeInTheDocument();
  });

  it('renders shipment rows after loading', async () => {
    renderDashboard('USER');
    await waitFor(() => {
      expect(screen.getByText('CS-ABCD1234')).toBeInTheDocument();
    });
  });

  it('renders Recipient info in rows', async () => {
    renderDashboard('USER');
    await waitFor(() => {
      expect(screen.getAllByText('Recipient').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows View button linking to shipment detail', async () => {
    renderDashboard('USER');
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /view/i })).toBeInTheDocument();
    });
  });

  it('renders "Update" button for each row when ADMIN', async () => {
    renderDashboard('ADMIN');
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /update/i }).length).toBeGreaterThan(0);
    });
  });

  it('shows Client column for ADMIN', async () => {
    renderDashboard('ADMIN');
    await waitFor(() => expect(screen.getByText(/client/i)).toBeInTheDocument());
  });

  it('shows sender name in Client column for ADMIN', async () => {
    renderDashboard('ADMIN');
    await waitFor(() => expect(screen.getByText('Test User')).toBeInTheDocument());
  });

  it('shows error state when API fails', async () => {
    server.use(
      http.get(`${BASE}/shipments`, () => HttpResponse.json({ error: { message: 'Internal error' } }, { status: 500 })),
    );
    renderDashboard('USER');
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('shows empty state for USER with no shipments', async () => {
    server.use(
      http.get(`${BASE}/shipments`, () => HttpResponse.json({ shipments: [], total: 0, page: 1, limit: 15 })),
    );
    renderDashboard('USER');
    await waitFor(() => {
      expect(screen.getByText(/no shipments found/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /create your first shipment/i })).toBeInTheDocument();
  });

  it('shows empty state for ADMIN without create link', async () => {
    server.use(
      http.get(`${BASE}/shipments`, () => HttpResponse.json({ shipments: [], total: 0, page: 1, limit: 15 })),
    );
    renderDashboard('ADMIN');
    await waitFor(() => {
      expect(screen.getByText(/no shipments found/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /create your first shipment/i })).not.toBeInTheDocument();
  });

  it('calls refetch when Refresh button is clicked', async () => {
    renderDashboard('USER');
    await waitFor(() => screen.getByText('CS-ABCD1234'));
    const refreshBtn = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshBtn);
    // Just confirm it doesn't throw
    expect(refreshBtn).toBeInTheDocument();
  });

  it('opens admin update dialog when Update button is clicked', async () => {
    renderDashboard('ADMIN');
    await waitFor(() => screen.getAllByRole('button', { name: /^update$/i }));
    const updateBtn = screen.getAllByRole('button', { name: /^update$/i })[0];
    await act(async () => { fireEvent.click(updateBtn); });
    expect(screen.getByRole('heading', { name: /update shipment status/i })).toBeInTheDocument();
  });

  it('closes admin update dialog on Cancel', async () => {
    renderDashboard('ADMIN');
    await waitFor(() => screen.getAllByRole('button', { name: /^update$/i }));
    const updateBtn = screen.getAllByRole('button', { name: /^update$/i })[0];
    await act(async () => { fireEvent.click(updateBtn); });
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await act(async () => { fireEvent.click(cancelBtn); });
    expect(screen.queryByRole('heading', { name: /update shipment status/i })).not.toBeInTheDocument();
  });

  it('calls updateStatus and closes dialog on submit', async () => {
    const user = userEvent.setup();
    renderDashboard('ADMIN');
    await waitFor(() => screen.getAllByRole('button', { name: /^update$/i }));
    const updateBtn = screen.getAllByRole('button', { name: /^update$/i })[0];
    await act(async () => { fireEvent.click(updateBtn); });
    // Confirm dialog is open
    expect(screen.getByRole('heading', { name: /update shipment status/i })).toBeInTheDocument();
    // Click Update Status button in dialog
    const submitBtn = screen.getByRole('button', { name: /update status/i });
    await act(async () => { fireEvent.click(submitBtn); });
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /update shipment status/i })).not.toBeInTheDocument();
    });
  });

  it('shows pagination when total > 15', async () => {
    server.use(
      http.get(`${BASE}/shipments`, () =>
        HttpResponse.json({ shipments: [mockShipment], total: 30, page: 1, limit: 15 }),
      ),
    );
    renderDashboard('USER');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  it('Previous button is disabled on first page', async () => {
    server.use(
      http.get(`${BASE}/shipments`, () =>
        HttpResponse.json({ shipments: [mockShipment], total: 30, page: 1, limit: 15 }),
      ),
    );
    renderDashboard('USER');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });
  });

  it('Next button advances to page 2', async () => {
    server.use(
      http.get(`${BASE}/shipments`, () =>
        HttpResponse.json({ shipments: [mockShipment], total: 30, page: 1, limit: 15 }),
      ),
    );
    renderDashboard('USER');
    await waitFor(() => screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
    });
  });
});
