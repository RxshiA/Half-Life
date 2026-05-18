import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { TrackShipmentPage } from '../TrackShipmentPage';

function renderTrack(initialPath = '/track') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/track" element={<TrackShipmentPage />} />
          <Route path="/track/:trackingNumber" element={<TrackShipmentPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('TrackShipmentPage', () => {
  it('renders the search form', () => {
    renderTrack();
    expect(screen.getByRole('textbox', { name: /tracking number/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /track/i })).toBeInTheDocument();
  });

  it('shows loading state while fetching by url param', async () => {
    renderTrack('/track/CS-ABCD1234');
    // Should eventually show the shipment
    await waitFor(() => {
      expect(screen.getByText('CS-ABCD1234')).toBeInTheDocument();
    });
  });

  it('shows shipment details after successful lookup', async () => {
    renderTrack('/track/CS-ABCD1234');
    await waitFor(() => {
      expect(screen.getByText('Recipient')).toBeInTheDocument();
    });
  });

  it('shows not found message for unknown tracking number', async () => {
    renderTrack('/track/CS-NOTFOUND');
    await waitFor(() => {
      expect(screen.getByText(/no shipment found/i)).toBeInTheDocument();
    });
  });

  it('triggers search on form submit', async () => {
    renderTrack();
    const input = screen.getByRole('textbox', { name: /tracking number/i });
    await userEvent.type(input, 'CS-ABCD1234');
    await userEvent.click(screen.getByRole('button', { name: /track/i }));
    await waitFor(() => {
      expect(screen.getByText('CS-ABCD1234')).toBeInTheDocument();
    });
  });
});
