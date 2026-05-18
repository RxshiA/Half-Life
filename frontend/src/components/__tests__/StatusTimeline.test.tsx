import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusTimeline, type ShipmentEvent } from '../StatusTimeline';

const events: ShipmentEvent[] = [
  {
    id: 'e1',
    status: 'PENDING',
    note: 'Shipment created',
    location: null,
    createdAt: new Date('2026-01-01T10:00:00Z').toISOString(),
  },
  {
    id: 'e2',
    status: 'IN_TRANSIT',
    note: 'Package in transit',
    location: 'Sydney Depot',
    createdAt: new Date('2026-01-02T14:00:00Z').toISOString(),
  },
];

describe('StatusTimeline', () => {
  it('shows "No tracking events" when events list is empty', () => {
    render(<StatusTimeline events={[]} />);
    expect(screen.getByText(/no tracking events/i)).toBeInTheDocument();
  });

  it('renders each event note', () => {
    render(<StatusTimeline events={events} />);
    expect(screen.getByText('Shipment created')).toBeInTheDocument();
    expect(screen.getByText('Package in transit')).toBeInTheDocument();
  });

  it('renders event locations when provided', () => {
    render(<StatusTimeline events={events} />);
    expect(screen.getByText('Sydney Depot')).toBeInTheDocument();
  });

  it('renders status badges for each event', () => {
    render(<StatusTimeline events={events} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
  });

  it('renders as an ordered list with aria-label', () => {
    render(<StatusTimeline events={events} />);
    expect(screen.getByRole('list', { name: /tracking timeline/i })).toBeInTheDocument();
  });
});
