import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PackageSearch } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground mt-2 mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
