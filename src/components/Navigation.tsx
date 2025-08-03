import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  CheckCircle, 
  Users, 
  FileText,
  Home,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      label: 'Contrôles',
      path: '/regulatory-controls',
      icon: CheckCircle
    },
    {
      label: 'Bâtiments',
      path: '/regulatory-controls/buildings',
      icon: Building2
    },
    {
      label: 'Prestataires',
      path: '/regulatory-controls/providers',
      icon: Users
    },
    {
      label: 'Documents',
      path: '/regulatory-controls/documents',
      icon: FileText
    },
    {
      label: 'Compteurs',
      path: '/meters',
      icon: Zap
    }
  ];

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold">Contrôles Réglementaires</h1>
            </div>
            
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className={cn(
                      "flex items-center space-x-2",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Link to={item.path}>
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
          
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;