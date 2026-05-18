import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/auth';
import {
  createShipmentSchema,
  listShipmentsSchema,
  updateStatusSchema,
} from './shipments.schemas';
import * as shipmentsController from './shipments.controller';

const router = Router();

// Public: track by tracking number (must be before /:id to avoid conflict)
router.get('/track/:trackingNumber', shipmentsController.trackShipment);

// All routes below require authentication
router.use(requireAuth);

router.post('/', validate(createShipmentSchema), shipmentsController.createShipment);
router.get('/', validate(listShipmentsSchema, 'query'), shipmentsController.listShipments);
router.get('/:id', shipmentsController.getShipment);

// Admin-only: update shipment status
router.patch(
  '/:id/status',
  requireRole('ADMIN'),
  validate(updateStatusSchema),
  shipmentsController.updateShipmentStatus,
);

export default router;
