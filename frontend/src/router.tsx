import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { DashboardPage } from '@/features/shipments/DashboardPage';
import { CreateShipmentPage } from '@/features/shipments/CreateShipmentPage';
import { ShipmentDetailPage } from '@/features/shipments/ShipmentDetailPage';
import { TrackShipmentPage } from '@/features/shipments/TrackShipmentPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'track', element: <TrackShipmentPage /> },
      { path: 'track/:trackingNumber', element: <TrackShipmentPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'shipments/new',
        element: (
          <ProtectedRoute>
            <CreateShipmentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'shipments/:id',
        element: (
          <ProtectedRoute>
            <ShipmentDetailPage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
