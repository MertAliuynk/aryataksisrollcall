'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  UserPlus,
  Menu,
  X,
  Home,
  LogOut,
  GraduationCap,
  Calendar,
  TrendingUp,
  Settings,
  BookOpen,
  CreditCard,
  Receipt
} from 'lucide-react';
import Link from 'next/link';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      icon: BarChart3,
      label: 'Yönetim Paneli',
      href: '/staff/dashboard',
      description: 'Genel istatistikler ve özet bilgiler'
    },
    {
      icon: Users,
      label: 'Öğrenci Listesi',
      href: '/staff/students',
      description: 'Tüm öğrencileri görüntüle ve yönet'
    },
    {
      icon: ClipboardCheck,
      label: 'Yoklama Takibi',
      href: '/staff/attendance-tracking',
      description: 'Yoklama kayıtlarını görüntüle'
    },
    {
      icon: UserPlus,
      label: 'Öğrenci Ekleme',
      href: '/staff/add-student',
      description: 'Yeni öğrenci kaydı oluştur'
    },
    {
      icon: BookOpen,
      label: 'Kurs Oluştur',
      href: '/staff/create-course',
      description: 'Yeni kurs tanımla'
    },
    {
      icon: GraduationCap,
      label: 'Tüm Kurslar',
      href: '/staff/courses',
      description: 'Kursları görüntüle ve yönet'
    },
    {
      icon: Calendar,
      label: 'Yoklama Alma',
      href: '/staff/take-attendance',
      description: 'Günlük yoklama işlemleri'
    },
    {
      icon: CreditCard,
      label: 'Ödeme Kontrolü',
      href: '/staff/payment-control',
      description: 'Aylık ödeme durumlarını kontrol et'
    },
    {
      icon: Receipt,
      label: 'Ödeme Takibi',
      href: '/staff/payment-tracking',
      description: 'Ödeme geçmişini görüntüle'
    }
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Çalışan Paneli</h2>
                <p className="text-blue-100 text-sm">Yönetim Sistemi</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`group flex items-center gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  active 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    active ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${active ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </p>
                    <p className={`text-sm ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link href="/">
            <Button variant="outline" className="w-full mb-2">
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => router.push('/')}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">Çalışan Paneli</span>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Content Area */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}