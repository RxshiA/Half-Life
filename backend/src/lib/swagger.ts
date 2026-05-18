import type { OpenAPIV3 } from 'openapi-types';

// ---------------------------------------------------------------------------
// Reusable schema fragments
// ---------------------------------------------------------------------------

const errorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'string', example: 'VALIDATION_ERROR' },
        message: { type: 'string', example: 'Validation failed' },
        details: { type: 'array', items: { type: 'object' } },
      },
    },
  },
};

const userSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
    email: { type: 'string', format: 'email', example: 'user@example.com' },
    fullName: { type: 'string', example: 'Jane Doe' },
    phone: { type: 'string', example: '+61400000001' },
    addressLine1: { type: 'string', example: '1 George Street' },
    addressLine2: { type: 'string', nullable: true, example: 'Unit 5' },
    city: { type: 'string', example: 'Sydney' },
    state: { type: 'string', example: 'NSW' },
    postalCode: { type: 'string', example: '2000' },
    country: { type: 'string', example: 'AU' },
    role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const shipmentEventSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    shipmentId: { type: 'string', format: 'uuid' },
    status: {
      type: 'string',
      enum: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED'],
    },
    location: { type: 'string', nullable: true, example: 'Sydney Depot' },
    note: { type: 'string', nullable: true, example: 'Picked up from sender' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const shipmentSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    trackingNumber: { type: 'string', example: 'CS-ABCD1234' },
    userId: { type: 'string', format: 'uuid' },
    senderName: { type: 'string', example: 'Jane Doe' },
    senderAddress: { type: 'string', example: '1 George St, Sydney NSW 2000' },
    recipientName: { type: 'string', example: 'John Smith' },
    recipientAddress: { type: 'string', example: '10 Collins St, Melbourne VIC 3000' },
    recipientPhone: { type: 'string', example: '+61400000099' },
    weightKg: { type: 'string', example: '2.5' },
    dimensionsCm: { type: 'string', example: '30x20x10' },
    packageType: {
      type: 'string',
      enum: ['DOCUMENT', 'PARCEL', 'FRAGILE', 'HEAVY'],
    },
    serviceLevel: {
      type: 'string',
      enum: ['STANDARD', 'EXPRESS', 'OVERNIGHT'],
    },
    declaredValue: { type: 'string', nullable: true, example: '500' },
    notes: { type: 'string', nullable: true, example: 'Fragile — handle with care' },
    status: {
      type: 'string',
      enum: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED'],
    },
    estimatedDelivery: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    events: {
      type: 'array',
      items: { $ref: '#/components/schemas/ShipmentEvent' },
    },
  },
};

// ---------------------------------------------------------------------------
// Full OpenAPI 3.0 document
// ---------------------------------------------------------------------------

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Courier Service API',
    version: '1.0.0',
    description:
      'REST API for the Courier Service application. Supports user registration, authentication, shipment creation & management, and public package tracking.',
    contact: {
      name: 'Courier Service',
    },
  },
  servers: [
    { url: 'http://localhost:4000/api', description: 'Local development' },
  ],
  tags: [
    { name: 'Auth', description: 'Registration, login, and current-user endpoints' },
    { name: 'Users', description: 'User profile management' },
    { name: 'Shipments', description: 'Shipment CRUD and tracking' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT obtained from `/api/auth/login` or `/api/auth/register`',
      },
    },
    schemas: {
      Error: errorSchema,
      User: userSchema,
      ShipmentEvent: shipmentEventSchema,
      Shipment: shipmentSchema,
    },
  },
  paths: {
    // ------------------------------------------------------------------
    // Auth
    // ------------------------------------------------------------------
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'fullName', 'phone', 'addressLine1', 'city', 'state', 'postalCode'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: {
                    type: 'string',
                    minLength: 8,
                    example: 'Secure1234',
                    description: 'Min 8 chars, must contain an uppercase letter and a digit',
                  },
                  fullName: { type: 'string', example: 'Jane Doe' },
                  phone: { type: 'string', example: '+61400000001' },
                  addressLine1: { type: 'string', example: '1 George Street' },
                  addressLine2: { type: 'string', example: 'Unit 5' },
                  city: { type: 'string', example: 'Sydney' },
                  state: { type: 'string', example: 'NSW' },
                  postalCode: { type: 'string', example: '2000' },
                  country: { type: 'string', example: 'AU', default: 'AU' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '409': { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'demo@courier.local' },
                  password: { type: 'string', example: 'User@1234' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the currently authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ------------------------------------------------------------------
    // Users
    // ------------------------------------------------------------------
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'Jane Smith' },
                  phone: { type: 'string', example: '+61400000002' },
                  addressLine1: { type: 'string', example: '2 Pitt Street' },
                  addressLine2: { type: 'string', nullable: true },
                  city: { type: 'string', example: 'Melbourne' },
                  state: { type: 'string', example: 'VIC' },
                  postalCode: { type: 'string', example: '3000' },
                  country: { type: 'string', example: 'AU' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ------------------------------------------------------------------
    // Shipments
    // ------------------------------------------------------------------
    '/shipments/track/{trackingNumber}': {
      get: {
        tags: ['Shipments'],
        summary: 'Public tracking lookup by tracking number',
        parameters: [
          {
            name: 'trackingNumber',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'CS-ABCD1234' },
          },
        ],
        responses: {
          '200': {
            description: 'Shipment with tracking history',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { shipment: { $ref: '#/components/schemas/Shipment' } },
                },
              },
            },
          },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/shipments': {
      get: {
        tags: ['Shipments'],
        summary: 'List shipments (own for USER, all for ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED'],
            },
            description: 'Filter by status',
          },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search by tracking number or recipient name' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Paginated list of shipments',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    shipments: { type: 'array', items: { $ref: '#/components/schemas/Shipment' } },
                    total: { type: 'integer', example: 42 },
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 20 },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        tags: ['Shipments'],
        summary: 'Create a new shipment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['recipientName', 'recipientAddress', 'recipientPhone', 'weightKg', 'dimensionsCm', 'packageType', 'serviceLevel'],
                properties: {
                  recipientName: { type: 'string', example: 'John Smith' },
                  recipientAddress: { type: 'string', example: '10 Collins St, Melbourne VIC 3000' },
                  recipientPhone: { type: 'string', example: '+61400000099' },
                  weightKg: { type: 'number', example: 2.5, description: 'Weight in kilograms' },
                  dimensionsCm: { type: 'string', example: '30x20x10', description: 'Format: LxWxH' },
                  packageType: { type: 'string', enum: ['DOCUMENT', 'PARCEL', 'FRAGILE', 'HEAVY'] },
                  serviceLevel: { type: 'string', enum: ['STANDARD', 'EXPRESS', 'OVERNIGHT'] },
                  declaredValue: { type: 'number', example: 500, description: 'Declared value in AUD (optional)' },
                  notes: { type: 'string', example: 'Handle with care' },
                  estimatedDelivery: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Shipment created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { shipment: { $ref: '#/components/schemas/Shipment' } },
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/shipments/{id}': {
      get: {
        tags: ['Shipments'],
        summary: 'Get a shipment by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Shipment detail with event history',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { shipment: { $ref: '#/components/schemas/Shipment' } },
                },
              },
            },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '403': { description: 'Forbidden — not your shipment', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/shipments/{id}/status': {
      patch: {
        tags: ['Shipments'],
        summary: 'Update shipment status (ADMIN only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED'],
                    example: 'IN_TRANSIT',
                  },
                  location: { type: 'string', example: 'Melbourne Depot' },
                  note: { type: 'string', example: 'Arrived at sorting facility' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Shipment with updated status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { shipment: { $ref: '#/components/schemas/Shipment' } },
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '403': { description: 'Forbidden — admin only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};
