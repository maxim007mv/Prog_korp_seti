'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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
  TrendingUp,
  Home,
  LogOut
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

function LiquidGlass({
  className = "",
  contentClassName = "",
  children,
}: React.PropsWithChildren<{ className?: string; contentClassName?: string }>) {
  return (
    <div className={`liquidGlass-wrapper ${className}`}>
      <div className="liquidGlass-effect" />
      <div className="liquidGlass-tint" />
      <div className="liquidGlass-shine" />
      <div className={`liquidGlass-text ${contentClassName}`}>{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sceneRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const [par, setPar] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;
    const step = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      setPar({ ...current.current });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Параллакс фон */}
      <div
        ref={sceneRef}
        onMouseMove={(e) => {
          const r = sceneRef.current?.getBoundingClientRect();
          if (!r) return;
          target.current.x = (e.clientX - r.left) / r.width - 0.5;
          target.current.y = (e.clientY - r.top) / r.height - 0.5;
        }}
        className="fixed inset-0 -z-10 will-change-transform"
      >
        <Image
          src="https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg"
          alt="Admin background"
          fill
          priority
          className="object-cover"
          style={{
            transform: `translate3d(${par.x * 10}px, ${par.y * 10}px, 0) scale(1.02)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-slate-900/70" />
      </div>

      <div className="flex min-h-screen text-white">
        {/* Sidebar с эффектом стекла */}
        <aside className="w-72 p-4">
          <div className="sticky top-4 space-y-4">
            {/* Лого */}
            <LiquidGlass className="p-6 rounded-[24px]">
              <h2 className="text-2xl font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                Админ-панель
              </h2>
              <p className="text-sm text-white/60 mt-1">Управление рестораном</p>
            </LiquidGlass>

            {/* Навигация */}
            <LiquidGlass className="p-4 rounded-[24px]">
              <nav>
                <ul className="space-y-1">
                  {ADMIN_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
                            isActive
                              ? 'bg-amber-400/20 text-amber-300 shadow-lg shadow-amber-400/10'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
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
            </LiquidGlass>

            {/* Дополнительные ссылки */}
            <LiquidGlass className="p-4 rounded-[24px]">
              <div className="space-y-1">
                <Link
                  href="/notifications"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Уведомления</span>
                </Link>
                <Link
                  href="/staff"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <UserCog className="h-4 w-4" />
                  <span className="text-sm">Зона официантов</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Home className="h-4 w-4" />
                  <span className="text-sm">Главная страница</span>
                </Link>
                <button
                  onClick={() => {/* logout logic */}}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-red-400/80 hover:bg-red-400/10 hover:text-red-300 transition-all w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Выйти</span>
                </button>
              </div>
            </LiquidGlass>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4">
          <div className="mb-4">
            <LiquidGlass className="p-4 rounded-[24px]">
              <div className="flex items-center justify-end gap-4">
                <NotificationBell />
              </div>
            </LiquidGlass>
          </div>
          
          {children}
        </main>

        {/* AI Chat Widget */}
        <AiChatWidget />
      </div>

      {/* SVG filter для эффекта стекла */}
      <svg style={{ display: "none" }}>
        <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Глобальные стили Liquid Glass */}
      <style jsx global>{`
        .liquidGlass-wrapper {
          position: relative;
          display: block;
          overflow: hidden;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .liquidGlass-effect {
          position: absolute;
          inset: 0;
          z-index: 0;
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          overflow: hidden;
          isolation: isolate;
        }
        .liquidGlass-tint {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: rgba(17, 25, 40, 0.75);
        }
        .liquidGlass-shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.1),
            inset -1px -1px 1px 1px rgba(255, 255, 255, 0.05);
          border-radius: inherit;
        }
        .liquidGlass-text {
          position: relative;
          z-index: 3;
          color: white;
        }
      `}</style>
    </>
  );
}
