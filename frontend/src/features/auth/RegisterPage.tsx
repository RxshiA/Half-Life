import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './AuthContext';
import { authApi } from './api';
import { extractApiError } from '@/lib/api';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a digit'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  addressLine1: z.string().min(3, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().default('AU'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { country: 'AU' },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { user, token } = await authApi.register(data);
      login(token, user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const apiError = extractApiError(err);
      toast.error(apiError.message);
    }
  };

  const fieldError = (name: keyof RegisterFormValues) => errors[name]?.message;

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Enter your details to register a new client account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Jane Smith" {...register('fullName')} />
                {fieldError('fullName') && (
                  <p className="text-xs text-destructive">{fieldError('fullName')}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {fieldError('email') && (
                  <p className="text-xs text-destructive">{fieldError('email')}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                {fieldError('password') && (
                  <p className="text-xs text-destructive">{fieldError('password')}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+61400000001" {...register('phone')} />
                {fieldError('phone') && (
                  <p className="text-xs text-destructive">{fieldError('phone')}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1">
                <Label htmlFor="addressLine1">Address</Label>
                <Input id="addressLine1" placeholder="1 Main Street" {...register('addressLine1')} />
                {fieldError('addressLine1') && (
                  <p className="text-xs text-destructive">{fieldError('addressLine1')}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Sydney" {...register('city')} />
                {fieldError('city') && (
                  <p className="text-xs text-destructive">{fieldError('city')}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="NSW" {...register('state')} />
                {fieldError('state') && (
                  <p className="text-xs text-destructive">{fieldError('state')}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" placeholder="2000" {...register('postalCode')} />
                {fieldError('postalCode') && (
                  <p className="text-xs text-destructive">{fieldError('postalCode')}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="AU" {...register('country')} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
