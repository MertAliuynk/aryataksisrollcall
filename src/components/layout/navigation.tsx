'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, UserPlus, Settings, ClipboardCheck, BarChart3, CreditCard, Receipt, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  {
    title: 'Öğrenci Listesi',
    href: '/students',
    icon: Users,
  },
  {
    title: 'Öğrenci Ekle',
    href: '/students/add',
    icon: UserPlus,
  },
  {
    title: 'Yoklama Al',
    href: '/attendance',
    icon: ClipboardCheck,
  },
  {
    title: 'Yoklama Takibi',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Ödeme Kontrolü',
    href: '/payment-control',
    icon: CreditCard,
  },
  {
    title: 'Ödeme Takibi',
    href: '/payment-tracking',
    icon: Receipt,
  },
  {
    title: 'Yönetim',
    href: '/management',
    icon: Settings,
  },
  {
    title: 'Kullanıcı Yönetimi',
    href: '/staff/users',
    icon: Shield,
  },
];

interface NavigationMenuProps {
  onItemClick?: () => void;
}

export function NavigationMenu({ onItemClick }: NavigationMenuProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}