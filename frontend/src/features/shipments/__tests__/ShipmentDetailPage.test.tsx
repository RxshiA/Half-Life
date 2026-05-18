import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/features/auth/AuthContext';
import { ShipmentDetailPage } from '../ShipmentDetailPage';

const BASE = 'http://localhost:4000/api';

function renderDetail(id = 's1', role: 'USER' | 'ADMIN' = 'USER') {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
    user: { id: 'u1', role, fullName: 'Test User' },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={[`/shipments/${id}`]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ShipmentDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading indicator initially', () => {
    renderDetail();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders shipment tracking number after load', async () => {
    renderDetail('s1');
    await waitFor(() =>
      expect(screen.getByText('CS-ABCD1234')).toBeInTheDocument(),
    );
  });

  it('renders Sender and Recipient sections', async () => {
    renderDetail('s1');
    await waitFor(() => {
      expect(screen.getByText('Sender')).toBeInTheDocument();
      expect(screen.getAllByText('Recipient').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders Package section with weight and service level', async () => {
    renderDetail('s1');
    await waitFor(() => expect(screen.getByText('Package')).toBeInTheDocument());
  });

  it('renders weight in kg', async () => {
    renderDetail('s1');
    await waitFor(() => expect(screen.getByText('1.5 kg')).toBeInTheDocument());
  });

  it('renders service level', async () => {
    renderDetail('s1');
    await waitFor(() => expect(screen.getByText('STANDARD')).toBeInTheDocument());
  });

  it('renders "Update Status" button for ADMIN', async () => {
    renderDetail('s1', 'ADMIN');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /update status/i })).toBeInTheDocument(),
    );
  });

  it('does NOT render "Update Status" button for USER', async () => {
    renderDetail('s1', 'USER');
    await waitFor(() => {
      expect(screen.getByText('CS-ABCD1234')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /update status/i })).not.toBeInTheDocument();
  });

  it('renders error state for not found shipment', async () => {
    renderDetail('not-found');
    await waitFor(() =>
      expect(screen.getByText(/not found|access denied/i)).toBeInTheDocument(),
    );
  });

  it('renders back to dashboard link on error', async () => {
    renderDetail('not-found');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument(),
    );
  });

  it('renders StatusTimeline with events', async () => {
    renderDetail('s1');
    await waitFor(() =>
      expect(screen.getByText('Shipment created')).toBeInTheDocument(),
    );
  });

  it('renders Tracking History section', async () => {
    renderDetail('s1');
    await waitFor(() => {
      expect(screen.getByText(/tracking history/i)).toBeInTheDocument();
    });
  });

  it('renders back navigation link', async () => {
    renderDetail('s1');
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument();
    });
  });

  it('ADMIN clicks Update Status and dialog opens', async () => {
    renderDetail('s1', 'ADMIN');
    await waitFor(() => screen.getByRole('button', { name: /update status/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update status/i }));
    });
    expect(screen.getByRole('heading', { name: /update status/i })).toBeInTheDocument();
  });

  it('Cancel button closes the update dialog', async () => {
    renderDetail('s1', 'ADMIN');
    await waitFor(() => screen.getByRole('button', { name: /update status/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update status/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });
    expect(screen.queryByRole('heading', { name: /update status/i })).not.toBeInTheDocument();
  });

  it('Save button submits and closes dialog', async () => {
    renderDetail('s1', 'ADMIN');
    await waitFor(() => screen.getByRole('button', { name: /update status/i }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update status/i }));
    });
    const saveBtn = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /update status/i })).not.toBeInTheDocument();
    });
  });

  it('shows declaredValue when present', async () => {
    server.use(
      http.get(`${BASE}/shipments/s1`, () =>
        HttpResponse.json({ shipment: { id: 's1', trackingNumber: 'CS-TEST', userId: 'u1', senderName: 'S', senderAddress: 'A', recipientName: 'R', recipientAddress: 'B', recipientPhone: '+1', weightKg: '2', dimensionsCm: '10x10x10', packageType: 'PARCEL', serviceLevel: 'EXPRESS', declaredValue: '500', notes: null, status: 'PENDING', estimatedDelivery: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), events: [] } }),
      ),
    );
    renderDetail('s1');
    await waitFor(() => expect(screen.getByText(/declared value/i)).toBeInTheDocument());
  });

  it('shows estimatedDelivery when present', async () => {
    server.use(
      http.get(`${BASE}/shipments/s1`, () =>
        HttpResponse.json({ shipment: { id: 's1', trackingNumber: 'CS-TEST', userId: 'u1', senderName: 'S', senderAddress: 'A', recipientName: 'R', recipientAddress: 'B', recipientPhone: '+1', weightKg: '2', dimensionsCm: '10x10x10', packageType: 'PARCEL', serviceLevel: 'EXPRESS', declaredValue: null, notes: 'Handle with care', status: 'PENDING', estimatedDelivery: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), events: [] } }),
      ),
    );
    renderDetail('s1');
    await waitFor(() => expect(screen.getByText(/est\. delivery/i)).toBeInTheDocument());
  });

  it('shows notes when present', async () => {
    server.use(
      http.get(`${BASE}/shipments/s1`, () =>
        HttpResponse.json({ shipment: { id: 's1', trackingNumber: 'CS-TEST', userId: 'u1', senderName: 'S', senderAddress: 'A', recipientName: 'R', recipientAddress: 'B', recipientPhone: '+1', weightKg: '2', dimensionsCm: '10x10x10', packageType: 'PARCEL', serviceLevel: 'EXPRESS', declaredValue: null, notes: 'Handle with care', status: 'PENDING', estimatedDelivery: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), events: [] } }),
      ),
    );
    renderDetail('s1');
    await waitFor(() => expect(screen.getByText('Handle with care')).toBeInTheDocument());
  });
});
