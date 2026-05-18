import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateShipment } from './hooks';
import { extractApiError } from '@/lib/api';

const createSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  recipientAddress: z.string().min(5, 'Recipient address is required'),
  recipientPhone: z.string().min(7, 'Recipient phone is required'),
  weightKg: z.coerce.number().positive('Weight must be positive'),
  dimensionsCm: z
    .string()
    .regex(/^\d+x\d+x\d+$/, 'Format: LxWxH (e.g. 30x20x10)'),
  packageType: z.enum(['DOCUMENT', 'PARCEL', 'FRAGILE', 'HEAVY']),
  serviceLevel: z.enum(['STANDARD', 'EXPRESS', 'OVERNIGHT']),
  declaredValue: z.coerce.number().nonnegative().optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;

export function CreateShipmentPage() {
  const navigate = useNavigate();
  const createMutation = useCreateShipment();
 
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { packageType: 'PARCEL', serviceLevel: 'STANDARD' },
  });

  const onSubmit = async (data: CreateFormValues) => {
    try {
      const shipment = await createMutation.mutateAsync({
        ...data,
        weightKg: Number(data.weightKg),
        declaredValue: data.declaredValue ? Number(data.declaredValue) : undefined,
        notes: data.notes || undefined,
      });
      toast.success(`Shipment created! Tracking: ${shipment.trackingNumber}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(extractApiError(err).message);
    }
  };

  const fe = (name: keyof CreateFormValues) => errors[name]?.message;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Shipment</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sender details are automatically captured from your profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipient Details</CardTitle>
          <CardDescription>Where should this shipment be delivered?</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-1">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input id="recipientName" placeholder="John Smith" {...register('recipientName')} />
                {fe('recipientName') && <p className="text-xs text-destructive">{fe('recipientName')}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="recipientAddress">Recipient Address</Label>
                <Input id="recipientAddress" placeholder="10 Park Rd, Melbourne VIC 3000" {...register('recipientAddress')} />
                {fe('recipientAddress') && <p className="text-xs text-destructive">{fe('recipientAddress')}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="recipientPhone">Recipient Phone</Label>
                <Input id="recipientPhone" placeholder="+61400000099" {...register('recipientPhone')} />
                {fe('recipientPhone') && <p className="text-xs text-destructive">{fe('recipientPhone')}</p>}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold mb-4">Package Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="weightKg">Weight (kg)</Label>
                  <Input id="weightKg" type="number" step="0.1" min="0.1" placeholder="1.5" {...register('weightKg')} />
                  {fe('weightKg') && <p className="text-xs text-destructive">{fe('weightKg')}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="dimensionsCm">Dimensions (LxWxH cm)</Label>
                  <Input id="dimensionsCm" placeholder="30x20x10" {...register('dimensionsCm')} />
                  {fe('dimensionsCm') && <p className="text-xs text-destructive">{fe('dimensionsCm')}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="packageType">Package Type</Label>
                  <Select id="packageType" {...register('packageType')}>
                    <option value="DOCUMENT">Document</option>
                    <option value="PARCEL">Parcel</option>
                    <option value="FRAGILE">Fragile</option>
                    <option value="HEAVY">Heavy</option>
                  </Select>
                  {fe('packageType') && <p className="text-xs text-destructive">{fe('packageType')}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="serviceLevel">Service Level</Label>
                  <Select id="serviceLevel" {...register('serviceLevel')}>
                    <option value="STANDARD">Standard</option>
                    <option value="EXPRESS">Express</option>
                    <option value="OVERNIGHT">Overnight</option>
                  </Select>
                  {fe('serviceLevel') && <p className="text-xs text-destructive">{fe('serviceLevel')}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="declaredValue">Declared Value ($, optional)</Label>
                  <Input id="declaredValue" type="number" step="0.01" min="0" placeholder="0.00" {...register('declaredValue')} />
                </div>

                <div className="col-span-2 space-y-1">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" placeholder="Handle with care…" rows={2} {...register('notes')} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                {isSubmitting || createMutation.isPending ? 'Creating…' : 'Create Shipment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
