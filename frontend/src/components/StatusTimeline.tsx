import { CheckCircle2, Circle, MapPin, Clock } from 'lucide-react';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';

export interface ShipmentEvent {
  id: string;
  status: string;
  location?: string | null;
  note?: string | null;
  createdAt: string;
}

interface StatusTimelineProps {
  events: ShipmentEvent[];
}

export function StatusTimeline({ events }: StatusTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No tracking events yet.</p>;
  }

  return (
    <ol className="relative border-l border-border ml-3" aria-label="Shipment tracking timeline">
      {events.map((event, idx) => (
        <li key={event.id} className="mb-6 ml-6 last:mb-0">
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-border">
            {idx === events.length - 1 ? (
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
          </span>
          <div className="flex flex-col gap-1">
            <ShipmentStatusBadge status={event.status} />
            {event.note && <p className="text-sm text-foreground mt-1">{event.note}</p>}
            {event.location && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {event.location}
              </p>
            )}
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
