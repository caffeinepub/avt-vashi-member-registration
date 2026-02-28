import { Link, useLocation } from '@tanstack/react-router';
import { Users, UserPlus, Heart, Upload } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navLinks = [
    { to: '/register', label: 'Register Member', icon: UserPlus },
    { to: '/members', label: 'Member List', icon: Users },
    { to: '/bulk-upload', label: 'Bulk Upload', icon: Upload },
  ];

  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'membership-app'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-0">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="font-display font-700 text-lg tracking-tight text-primary-foreground">
                MemberHub
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = currentPath === to || (to === '/register' && currentPath === '/');
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MemberHub. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with{' '}
              <Heart className="w-3.5 h-3.5 fill-destructive text-destructive mx-0.5" />
              {' '}using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
