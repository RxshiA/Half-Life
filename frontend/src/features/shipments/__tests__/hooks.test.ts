import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useShipments, useCreateShipment, useTrackShipment } from '../hooks';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useShipments', () => {
  it('fetches shipments list successfully', async () => {
    const { result } = renderHook(() => useShipments(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.shipments).toHaveLength(1);
    expect(result.current.data?.total).toBe(1);
  });

  it('fetches with status filter', async () => {
    const { result } = renderHook(() => useShipments({ status: 'PENDING' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe('useTrackShipment', () => {
  it('fetches a shipment by tracking number', async () => {
    const { result } = renderHook(() => useTrackShipment('CS-ABCD1234'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.trackingNumber).toBe('CS-ABCD1234');
  });

  it('returns error state for unknown tracking number', async () => {
    const { result } = renderHook(() => useTrackShipment('CS-NOTFOUND'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('is disabled when tracking number is empty', () => {
    const { result } = renderHook(() => useTrackShipment(''), {
      wrapper: createWrapper(),
    });
    expect(result.current.isFetching).toBe(false);
  });
});

describe('useCreateShipment', () => {
  it('successfully creates a shipment via mutation', async () => {
    const { result } = renderHook(() => useCreateShipment(), { wrapper: createWrapper() });

    result.current.mutate({
      recipientName: 'Bob',
      recipientAddress: '2 Rd, Melbourne VIC 3000',
      recipientPhone: '+61400000099',
      weightKg: 1.5,
      dimensionsCm: '30x20x10',
      packageType: 'PARCEL',
      serviceLevel: 'STANDARD',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.trackingNumber).toBe('CS-ABCD1234');
  });
});
