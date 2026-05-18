import { Badge } from '@/components/ui/badge';
import { type VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  PICKED_UP: { label: 'Picked Up', variant: 'info' },
  IN_TRANSIT: { label: 'In Transit', variant: 'info' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', variant: 'warning' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

interface ShipmentStatusBadgeProps {
  status: string;
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'secondary' as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
