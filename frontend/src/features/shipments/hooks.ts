import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentsApi, type ListShipmentsParams, type CreateShipmentInput, type UpdateStatusInput } from './api';

export const shipmentKeys = {
  all: ['shipments'] as const,
  list: (params?: ListShipmentsParams) => [...shipmentKeys.all, 'list', params] as const,
  detail: (id: string) => [...shipmentKeys.all, 'detail', id] as const,
  track: (tn: string) => [...shipmentKeys.all, 'track', tn] as const,
};

export function useShipments(params?: ListShipmentsParams) {
  return useQuery({
    queryKey: shipmentKeys.list(params),
    queryFn: () => shipmentsApi.list(params),
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: () => shipmentsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useTrackShipment(trackingNumber: string) {
  return useQuery({
    queryKey: shipmentKeys.track(trackingNumber),
    queryFn: () => shipmentsApi.track(trackingNumber),
    enabled: Boolean(trackingNumber),
    retry: false,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShipmentInput) => shipmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusInput }) =>
      shipmentsApi.updateStatus(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(id) });
    },
  });
}
