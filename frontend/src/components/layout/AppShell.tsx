import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Toaster } from '@/components/ui/sonner';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
