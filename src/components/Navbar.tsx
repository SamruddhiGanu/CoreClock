import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Timer, LayoutDashboard, LogIn, LogOut, Dumbbell,Calendar,MessageSquare} from 'lucide-react';
import { cn } from '@/lib/utils';


const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

const navLinks = [
  { to: '/', label: 'Timer', icon: Timer, requireAuth: false },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requireAuth: true },
  { to: '/calendar', label: 'Calendar', icon: Calendar, requireAuth: true },
  { to: '/chatbot', label: 'AI Coach', icon: MessageSquare, requireAuth: true },
];

  // Filter nav links based on auth status
  const visibleLinks = navLinks.filter(link => 
    !link.requireAuth || (link.requireAuth && token)
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-lg font-bold text-primary text-glow-cyan tracking-wider">
            FITPULSE
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2 transition-all",
                  location.pathname === to && "bg-muted text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}

          {/* Auth Button */}
          {token ? (
            <Button 
              onClick={handleLogout}
              variant="neon" 
              size="sm" 
              className="ml-2 gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="neon" size="sm" className="ml-2 gap-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;