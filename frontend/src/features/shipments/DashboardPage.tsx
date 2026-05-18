import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Search, RefreshCcw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ShipmentStatusBadge } from '@/components/ShipmentStatusBadge';
import { useAuth } from '@/features/auth/AuthContext';
import { useShipments, useUpdateShipmentStatus } from './hooks';
import { extractApiError } from '@/lib/api';

const STATUS_OPTIONS = [
  '', 'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED',
];

export function DashboardPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [updateDialog, setUpdateDialog] = useState<{ id: string; current: string } | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const { data, isLoading, isError, refetch } = useShipments({
    status: statusFilter || undefined,
    q: search || undefined,
    page,
    limit: 15,
  });

  const updateMutation = useUpdateShipmentStatus();

  const handleUpdateStatus = async () => {
    if (!updateDialog || !newStatus) return;
    try {
      await updateMutation.mutateAsync({
        id: updateDialog.id,
        data: { status: newStatus, note: statusNote || undefined },
      });
      toast.success('Status updated successfully');
      setUpdateDialog(null);
      setNewStatus('');
      setStatusNote('');
    } catch (err) {
      toast.error(extractApiError(err).message);
    }
  };

  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user?.role === 'ADMIN' ? 'All Shipments' : 'My Shipments'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user?.role === 'ADMIN' ? 'Manage all customer shipments' : 'Track and manage your shipments'}
          </p>
        </div>
        {user?.role === 'USER' && (
          <Link to="/shipments/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Shipment
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tracking number or name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-48"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()} aria-label="Refresh">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Loading shipments…
            </div>
          )}

          {isError && (
            <div className="py-8 text-center text-destructive text-sm">
              Failed to load shipments. Please try again.
            </div>
          )}

          {!isLoading && !isError && data?.shipments.length === 0 && (
            <div className="py-12 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No shipments found.</p>
              {user?.role === 'USER' && (
                <Link to="/shipments/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create your first shipment
                  </Button>
                </Link>
              )}
            </div>
          )}

          {!isLoading && !isError && (data?.shipments.length ?? 0) > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Recipient</TableHead>
                  {user?.role === 'ADMIN' && <TableHead>Client</TableHead>}
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-xs">{shipment.trackingNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{shipment.recipientName}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {shipment.recipientAddress}
                      </div>
                    </TableCell>
                    {user?.role === 'ADMIN' && (
                      <TableCell className="text-sm">{shipment.senderName}</TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline">{shipment.serviceLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <ShipmentStatusBadge status={shipment.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link to={`/shipments/${shipment.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUpdateDialog({ id: shipment.id, current: shipment.status });
                              setNewStatus(shipment.status);
                            }}
                          >
                            Update
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({data?.total ?? 0} total)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin status update dialog */}
      <Dialog open={Boolean(updateDialog)} onOpenChange={(open) => !open && setUpdateDialog(null)}>
        <DialogContent>
          <DialogClose onClose={() => setUpdateDialog(null)} />
          <DialogHeader>
            <DialogTitle>Update Shipment Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {STATUS_OPTIONS.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Note (optional)</label>
              <Input
                placeholder="e.g. Picked up from sender"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setUpdateDialog(null)}>Cancel</Button>
              <Button onClick={handleUpdateStatus} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Update Status'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
