'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ChefHat, 
  Users, 
  Calendar, 
  FileText, 
  UserCog, 
  BarChart3,
  Brain,
  Bell,
  TrendingUp
} from 'lucide-react';
import { NotificationBell } from '@/components/features/notifications';
import { AiChatWidget } from '@/components/features/ai/AiChatWidget';

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/ai-insights', label: 'AI Инсайты', icon: Brain },
  { href: '/admin/predictions', label: 'AI Предсказания', icon: TrendingUp },
  { href: '/admin/menu', label: 'Меню', icon: ChefHat },
  { href: '/admin/tables', label: 'Столы', icon: Users },
  { href: '/admin/bookings', label: 'Бронирования', icon: Calendar },
  { href: '/admin/orders', label: 'Заказы', icon: FileText },
  { href: '/admin/waiters', label: 'Официанты', icon: UserCog },
  { href: '/admin/reports', label: 'Отчёты', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-xl font-bold text-accent">Админ-панель</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Дополнительные ссылки */}
        <div className="border-t p-4">
          <Link
            href="/notifications"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            <Bell className="h-4 w-4" />
            Уведомления
          </Link>
          <Link
            href="/staff"
            className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            → Зона официантов
          </Link>
          <Link
            href="/"
            className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            → Главная страница
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="border-b bg-white p-4 flex items-center justify-end gap-4">
          <NotificationBell />
        </div>
        {children}
      </main>

      {/* AI Chat Widget */}
      <AiChatWidget />
    </div>
  );
}
