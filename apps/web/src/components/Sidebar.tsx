import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  FileText,
  Truck,
  Receipt,
  Settings,
  PillBottle,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore, type Role } from '@/store/auth';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/caisse', icon: ShoppingCart, label: 'Caisse' },
  { to: '/produits', icon: Package, label: 'Produits' },
  { to: '/stock', icon: Boxes, label: 'Stock & Lots' },
  { to: '/peremptions', icon: AlertTriangle, label: 'Péremptions' },
  { to: '/ventes', icon: Receipt, label: 'Ventes' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/ordonnances', icon: FileText, label: 'Ordonnances' },
  {
    to: '/achats',
    icon: Truck,
    label: 'Achats',
    roles: ['ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT'],
  },
  {
    to: '/parametres',
    icon: Settings,
    label: 'Paramètres',
    roles: ['ADMIN', 'PHARMACIEN_TITULAIRE'],
  },
];

export function Sidebar() {
  const { hasRole } = useAuthStore();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <PillBottle size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-gray-900">PharmaDJ</h1>
            <p className="text-xs text-gray-500">Gestion de pharmacie</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (item.roles && !hasRole(...item.roles)) return null;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 px-3">
          <p>PharmaDJ v1.0.0</p>
          <p>© 2026 - Djibouti</p>
        </div>
      </div>
    </aside>
  );
}
