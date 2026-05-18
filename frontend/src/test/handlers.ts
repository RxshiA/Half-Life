import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:4000/api';

export const mockUser = {
  id: 'u1',
  email: 'test@example.com',
  fullName: 'Test User',
  phone: '+61400000001',
  addressLine1: '1 Test St',
  addressLine2: null,
  city: 'Sydney',
  state: 'NSW',
  postalCode: '2000',
  country: 'AU',
  role: 'USER' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockAdmin = {
  ...mockUser,
  id: 'a1',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'ADMIN' as const,
};

export const mockShipment = {
  id: 's1',
  trackingNumber: 'CS-ABCD1234',
  userId: 'u1',
  senderName: 'Test User',
  senderAddress: '1 Test St, Sydney NSW 2000',
  recipientName: 'Recipient',
  recipientAddress: '2 Rd, Melbourne VIC 3000',
  recipientPhone: '+61400000099',
  weightKg: '1.5',
  dimensionsCm: '30x20x10',
  packageType: 'PARCEL',
  serviceLevel: 'STANDARD',
  declaredValue: null,
  notes: null,
  status: 'PENDING',
  estimatedDelivery: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  events: [
    {
      id: 'e1',
      shipmentId: 's1',
      status: 'PENDING',
      location: null,
      note: 'Shipment created',
      createdAt: new Date().toISOString(),
    },
  ],
};

export const handlers = [
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ user: mockUser, token: 'mock-token-123' }),
  ),

  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json({ user: mockUser, token: 'mock-token-123' }, { status: 201 }),
  ),

  http.get(`${BASE}/auth/me`, () => HttpResponse.json({ user: mockUser })),

  http.get(`${BASE}/shipments`, () =>
    HttpResponse.json({ shipments: [mockShipment], total: 1, page: 1, limit: 20 }),
  ),

  http.get(`${BASE}/shipments/track/:trackingNumber`, ({ params }) => {
    const { trackingNumber } = params;
    if (trackingNumber === 'CS-NOTFOUND') {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });
    }
    return HttpResponse.json({ shipment: { ...mockShipment, trackingNumber } });
  }),

  http.get(`${BASE}/shipments/:id`, ({ params }) => {
    if (params['id'] === 'not-found') {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });
    }
    return HttpResponse.json({ shipment: mockShipment });
  }),

  http.post(`${BASE}/shipments`, () =>
    HttpResponse.json({ shipment: mockShipment }, { status: 201 }),
  ),

  http.patch(`${BASE}/shipments/:id/status`, () =>
    HttpResponse.json({ shipment: { ...mockShipment, status: 'PICKED_UP' } }),
  ),
];
