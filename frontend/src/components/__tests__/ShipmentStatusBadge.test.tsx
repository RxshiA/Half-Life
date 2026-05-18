import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShipmentStatusBadge } from '../ShipmentStatusBadge';

const cases: Array<[string, string]> = [
  ['PENDING', 'Pending'],
  ['PICKED_UP', 'Picked Up'],
  ['IN_TRANSIT', 'In Transit'],
  ['OUT_FOR_DELIVERY', 'Out for Delivery'],
  ['DELIVERED', 'Delivered'],
  ['CANCELLED', 'Cancelled'],
  ['FAILED', 'Failed'],
  ['UNKNOWN_STATUS', 'UNKNOWN_STATUS'],
];

describe('ShipmentStatusBadge', () => {
  it.each(cases)('renders label "%s" → "%s"', (status, label) => {
    render(<ShipmentStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
