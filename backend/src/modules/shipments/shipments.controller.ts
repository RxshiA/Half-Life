import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import * as shipmentsService from './shipments.service';
import {
  CreateShipmentInput,
  ListShipmentsQuery,
  UpdateStatusInput,
  TrackingNumberParams,
} from './shipments.schemas';

export const createShipment = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentsService.createShipment( 
    req.user!.sub,
    req.validatedBody as CreateShipmentInput,
  );
  res.status(201).json({ shipment });
});

export const listShipments = asyncHandler(async (req: Request, res: Response) => {
  const result = await shipmentsService.listShipments(
    req.user!.sub,
    req.user!.role,
    req.validatedQuery as ListShipmentsQuery,
  );
  res.status(200).json(result);
});

export const getShipment = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentsService.getShipment(
    String(req.params['id']),
    req.user!.sub,
    req.user!.role,
  );
  res.status(200).json({ shipment });
});

export const updateShipmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await shipmentsService.updateShipmentStatus(
    String(req.params['id']),
    req.user!.sub,
    req.validatedBody as UpdateStatusInput,
  );
  res.status(200).json({ shipment });
});

export const trackShipment = asyncHandler(async (req: Request, res: Response) => {
  const { trackingNumber } = req.params as TrackingNumberParams;
  const shipment = await shipmentsService.trackShipment(trackingNumber);
  res.status(200).json({ shipment });
});
