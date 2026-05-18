import api from '@/lib/api';

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: string;
  location?: string | null;
  note?: string | null;
  createdAt: string;
  createdById?: string | null;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  userId: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  weightKg: string;
  dimensionsCm: string;
  packageType: string;
  serviceLevel: string;
  declaredValue?: string | null;
  notes?: string | null;
  status: string;
  estimatedDelivery?: string | null;
  createdAt: string;
  updatedAt: string;
  events?: ShipmentEvent[];
}

export interface ShipmentsListResult {
  shipments: Shipment[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateShipmentInput {
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  weightKg: number;
  dimensionsCm: string;
  packageType: string;
  serviceLevel: string;
  declaredValue?: number;
  notes?: string;
  estimatedDelivery?: string;
}

export interface UpdateStatusInput {
  status: string;
  location?: string;
  note?: string;
}

export interface ListShipmentsParams {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export const shipmentsApi = {
  list: async (params?: ListShipmentsParams): Promise<ShipmentsListResult> => {
    const res = await api.get<ShipmentsListResult>('/shipments', { params });
    return res.data;
  },

  get: async (id: string): Promise<Shipment> => {
    const res = await api.get<{ shipment: Shipment }>(`/shipments/${id}`);
    return res.data.shipment;
  },

  create: async (data: CreateShipmentInput): Promise<Shipment> => {
    const res = await api.post<{ shipment: Shipment }>('/shipments', data);
    return res.data.shipment;
  },

  updateStatus: async (id: string, data: UpdateStatusInput): Promise<Shipment> => {
    const res = await api.patch<{ shipment: Shipment }>(`/shipments/${id}/status`, data);
    return res.data.shipment;
  },

  track: async (trackingNumber: string): Promise<Shipment> => {
    const res = await api.get<{ shipment: Shipment }>(`/shipments/track/${trackingNumber}`);
    return res.data.shipment;
  },
};
