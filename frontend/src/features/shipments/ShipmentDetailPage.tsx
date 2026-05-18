import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ShipmentStatusBadge } from '@/components/ShipmentStatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { useAuth } from '@/features/auth/AuthContext';
import { useShipment, useUpdateShipmentStatus } from './hooks';
import { extractApiError } from '@/lib/api';

const STATUS_OPTIONS = [
  'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED',
];

export function ShipmentDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: shipment, isLoading, isError } = useShipment(id);
  const updateMutation = useUpdateShipmentStatus();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading…</div>;
  }

  if (isError || !shipment) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-sm">Shipment not found or access denied.</p>
        <Link to="/dashboard">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handleUpdate = async () => {
    if (!newStatus) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: { status: newStatus, note: note || undefined, location: location || undefined },
      });
      toast.success('Status updated');
      setDialogOpen(false);
    } catch (err) {
      toast.error(extractApiError(err).message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Shipment <span className="font-mono text-lg">{shipment.trackingNumber}</span>
          </h1>
          <ShipmentStatusBadge status={shipment.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Sender</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{shipment.senderName}</p>
            <p className="text-muted-foreground">{shipment.senderAddress}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recipient</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{shipment.recipientName}</p>
            <p className="text-muted-foreground">{shipment.recipientAddress}</p>
            <p className="text-muted-foreground">{shipment.recipientPhone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Package</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span>{shipment.weightKg} kg</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Dimensions</span><span>{shipment.dimensionsCm} cm</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{shipment.packageType}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span>{shipment.serviceLevel}</span></div>
            {shipment.declaredValue && (
              <div className="flex justify-between"><span className="text-muted-foreground">Declared Value</span><span>${shipment.declaredValue}</span></div>
            )}
            {shipment.estimatedDelivery && (
              <div className="flex justify-between"><span className="text-muted-foreground">Est. Delivery</span><span>{new Date(shipment.estimatedDelivery).toLocaleDateString()}</span></div>
            )}
            {shipment.notes && <p className="text-muted-foreground pt-2">{shipment.notes}</p>}
          </CardContent>
        </Card>

        {user?.role === 'ADMIN' && (
          <Card>
            <CardHeader><CardTitle className="text-base">Admin Actions</CardTitle></CardHeader>
            <CardContent>
              <Button
                onClick={() => { setNewStatus(shipment.status); setDialogOpen(true); }}
                className="w-full"
              >
                Update Status
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Tracking History</CardTitle></CardHeader>
        <CardContent>
          <StatusTimeline events={shipment.events ?? []} />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </Select>
            <Input placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
