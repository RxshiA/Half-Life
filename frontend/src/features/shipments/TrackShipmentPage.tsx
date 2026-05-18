import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShipmentStatusBadge } from '@/components/ShipmentStatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { useTrackShipment } from './hooks';

export function TrackShipmentPage() {
  const { trackingNumber: urlTN } = useParams<{ trackingNumber?: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState(urlTN ?? '');
  const [query, setQuery] = useState(urlTN ?? '');

  const { data: shipment, isLoading, isError, error } = useTrackShipment(query);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().toUpperCase();
    setQuery(trimmed);
    if (trimmed) {
      navigate(`/track/${trimmed}`, { replace: true });
    }
  };

  const notFound =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 404;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Track Your Shipment</h1>
        <p className="text-muted-foreground mt-2">
          Enter your tracking number to see the status of your delivery.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="CS-XXXXXXXX"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono"
          aria-label="Tracking number"
        />
        <Button type="submit" className="gap-2" disabled={!input.trim()}>
          <Search className="h-4 w-4" />
          Track
        </Button>
      </form>

      {isLoading && query && (
        <div className="text-center text-muted-foreground py-8">Looking up {query}…</div>
      )}

      {notFound && (
        <div className="text-center py-8">
          <p className="text-destructive font-medium">No shipment found</p>
          <p className="text-muted-foreground text-sm mt-1">
            Double-check the tracking number and try again.
          </p>
        </div>
      )}

      {shipment && !isLoading && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-base">{shipment.trackingNumber}</CardTitle>
                <ShipmentStatusBadge status={shipment.status} />
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">From</p>
                  <p className="font-medium">{shipment.senderName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">To</p>
                  <p className="font-medium">{shipment.recipientName}</p>
                  <p className="text-muted-foreground text-xs">{shipment.recipientAddress}</p>
                </div>
              </div>
              {shipment.estimatedDelivery && (
                <p className="text-muted-foreground">
                  Estimated delivery:{' '}
                  <span className="font-medium text-foreground">
                    {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Tracking History</CardTitle></CardHeader>
            <CardContent>
              <StatusTimeline events={shipment.events ?? []} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
