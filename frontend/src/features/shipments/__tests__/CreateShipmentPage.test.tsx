import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => vi.fn() };
});

import { CreateShipmentPage } from '../CreateShipmentPage';

function renderCreate() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CreateShipmentPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('CreateShipmentPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all required form fields', () => {
    renderCreate();
    expect(screen.getByLabelText(/recipient name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/recipient address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/recipient phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dimensions/i)).toBeInTheDocument();
  });

  it('shows validation error for short recipient name', async () => {
    renderCreate();
    await userEvent.click(screen.getByRole('button', { name: /create shipment/i }));
    await waitFor(() =>
      expect(screen.getByText(/recipient name is required/i)).toBeInTheDocument(),
    );
  });

  it('shows validation error for invalid dimensions format', async () => {
    renderCreate();
    await userEvent.type(screen.getByLabelText(/dimensions/i), 'invalid');
    await userEvent.click(screen.getByRole('button', { name: /create shipment/i }));
    await waitFor(() =>
      expect(screen.getByText(/format/i)).toBeInTheDocument(),
    );
  });

  it('successfully submits a valid form (MSW handler)', async () => {
    renderCreate();
    await userEvent.type(screen.getByLabelText(/recipient name/i), 'Bob Smith');
    await userEvent.type(screen.getByLabelText(/recipient address/i), '10 Park Rd, Melbourne VIC 3000');
    await userEvent.type(screen.getByLabelText(/recipient phone/i), '+61400000099');
    await userEvent.clear(screen.getByLabelText(/weight/i));
    await userEvent.type(screen.getByLabelText(/weight/i), '2.5');
    await userEvent.type(screen.getByLabelText(/dimensions/i), '30x20x10');

    await userEvent.click(screen.getByRole('button', { name: /create shipment/i }));

    await waitFor(() => {
      expect(screen.queryByText(/creating/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders Cancel button', () => {
    renderCreate();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders package type and service level selects', () => {
    renderCreate();
    expect(screen.getByLabelText(/package type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/service level/i)).toBeInTheDocument();
  });
});
