import { Link, useNavigate } from 'react-router-dom';
import { Package, LogOut, User, LayoutDashboard, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-semibold">
          <Package className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>CourierPro</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/track">
            <Button variant="ghost" size="sm" className="gap-1">
              <Search className="h-4 w-4" />
              Track
            </Button>
          </Link>

          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.fullName}
                {user.role === 'ADMIN' && (
                  <span className="ml-1 text-xs text-primary font-medium">(Admin)</span>
                )}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
