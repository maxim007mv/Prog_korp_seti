"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import {
  UtensilsCrossed,
  Calendar,
  Menu,
  Search,
  Star,
  Users,
  BedDouble,
  Clock4,
} from "lucide-react";

// Динамический импорт тяжелого компонента Tilt для улучшения производительности
const Tilt = dynamic(() => import('./components/Tilt').then(mod => mod.Tilt), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-white/5 rounded-[28px]" />
});

const chip = (active = false) =>
  `px-3.5 py-1.5 rounded-xl text-sm border ${active ? "bg-white/20 border-white/30 shadow-inner" : "bg-white/5 border-white/10 hover:bg-white/10"}`;

/* ========== LIQUID GLASS (1:1 как в эталоне) ========== */
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

export default function HomePage() {
  /* Параллакс фона с инерцией */
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
    <main className="relative min-h-screen text-white font-sans overflow-hidden">
      {/* ===== ПАРАЛЛАКС-ФОН ===== */}
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
          alt="Фон ресторана"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover"
          style={{
            transform: `translate3d(${par.x * 10}px, ${par.y * 10}px, 0) scale(1.02)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            transform: `translate3d(${par.x * 18}px, ${par.y * 18}px, 0)`,
            background:
              "radial-gradient(70% 70% at 70% 30%, rgba(255,184,74,.38), transparent 55%), linear-gradient(180deg, rgba(15,15,20,.6), rgba(15,15,20,.92))",
          }}
        />
        <div
          className="absolute -left-10 top-24 h-64 w-64 rounded-full blur-3xl bg-amber-400/20"
          style={{ transform: `translate3d(${par.x * 28}px, ${par.y * 28}px, 0)` }}
        />
        <div
          className="absolute -right-10 bottom-10 h-72 w-72 rounded-full blur-3xl bg-white/10"
          style={{ transform: `translate3d(${par.x * -24}px, ${par.y * -24}px, 0)` }}
        />
      </div>

      {/* ===== СОДЕРЖИМОЕ ===== */}
      <div className="container-custom relative z-10 py-10 md:py-14 space-y-16 md:space-y-20">
        {/* HERO */}
        <section className="px-4">
          <Tilt>
            <LiquidGlass className="mx-auto max-w-4xl p-0 rounded-[28px]">
              <div className="p-8 md:p-12 text-center">
                <span className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-sm font-medium tracking-wide text-amber-300">
                  FINE DINING • SINCE 2012
                </span>
                <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                  ДОБРО ПОЖАЛОВАТЬ<br />
                  <span className="text-amber-300 drop-shadow">В НАШ РЕСТОРАН</span>
                </h1>
                <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80">
                  Изысканная кухня и непревзойденный сервис —{" "}
                  <span className="ml-1.5 bg-amber-400 text-black px-2 py-0.5 rounded-md">
                    ЭСТЕТИЧНО И ЧИСТО
                  </span>
                </p>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                  <Link href="/booking">
                    <Button
                      size="lg"
                      className="rounded-2xl bg-amber-400 text-black hover:bg-amber-300 shadow-[0_12px_28px_rgba(255,184,74,.45)] transition-transform hover:scale-105"
                    >
                      <Calendar className="mr-3 h-6 w-6" />
                      ЗАБРОНИРОВАТЬ СТОЛ
                    </Button>
                  </Link>
                  <Link href="/menu">
                    <button className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-base font-medium text-white backdrop-blur hover:bg-white/20 transition">
                      <Menu className="mr-3 h-6 w-6" />
                      ПОСМОТРЕТЬ МЕНЮ
                    </button>
                  </Link>
                </div>
              </div>
            </LiquidGlass>
          </Tilt>
        </section>

        {/* ОСОБЕННОСТИ */}
        <section className="px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold uppercase tracking-tight">НАШИ ОСОБЕННОСТИ</h2>
            <p className="mt-3 text-xl text-white/80">
              Что делает нас <span className="text-amber-300">уникальными</span>
            </p>
          </div>
          <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3">
            {[
              { icon: <UtensilsCrossed className="h-8 w-8" />, title: "Изысканная кухня", text: "Свежие продукты и авторские рецепты" },
              { icon: <Calendar className="h-8 w-8" />, title: "Удобное бронирование", text: "Дата, время и гости — за пару кликов" },
              { icon: <Menu className="h-8 w-8" />, title: "Разнообразное меню", text: "От классики до дегустационных сетов" },
            ].map((f, i) => (
              <Tilt key={i}>
                <LiquidGlass className="p-6 rounded-[28px]">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold uppercase tracking-wider">{f.title}</h3>
                  <p className="text-white/75 font-medium">{f.text}</p>
                </LiquidGlass>
              </Tilt>
            ))}
          </div>
        </section>

        {/* ИСТОРИЯ */}
        <section className="px-4">
          <Tilt>
            <LiquidGlass className="mx-auto max-w-5xl p-0 rounded-[28px]">
            <div className="p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">История ресторана и отеля</h2>
              <div className="relative pl-6">
                <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-white/15" />
                {[
                  { year: "2012", title: "Открытие ресторана", text: "Маленький зал на 40 мест, авторское меню." },
                  { year: "2016", title: "Первый бутик-отель", text: "10 номеров, собственная кондитерская." },
                  { year: "2019", title: "Реконструкция", text: "Новый интерьер с glass-эстетикой и умным светом." },
                  { year: "2024", title: "Смарт-система бронирования", text: "Единая платформа для зала и номеров." },
                ].map((ev) => (
                  <div key={ev.year} className="flex gap-4 mb-6 last:mb-0">
                    <div className="shrink-0 h-6 w-6 rounded-full bg-amber-400/90 ring-4 ring-amber-400/25 mt-1" />
                    <div>
                      <div className="text-amber-300 font-semibold">{ev.year}</div>
                      <div className="text-lg font-semibold">{ev.title}</div>
                      <div className="text-white/75">{ev.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </LiquidGlass>
          </Tilt>
        </section>

        {/* СТАТИСТИКА */}
        <section className="px-4">
          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <Tilt>
                <LiquidGlass className="p-0 rounded-[28px]">
                  <div className="p-5 flex items-center gap-5">
                    {/* KPI-кольцо */}
                    <svg width="110" height="110" viewBox="0 0 110 110" className="drop-shadow">
                      <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="8" />
                      <circle
                        cx="55"
                        cy="55"
                        r="42"
                        fill="none"
                        stroke="rgba(255,184,74,.95)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42 * 0.84} ${2 * Math.PI * 42 * (1 - 0.84)}`}
                        transform="rotate(-90 55 55)"
                      />
                    </svg>
                    <div>
                      <div className="text-4xl font-extrabold">84%</div>
                      <div className="text-white/70">Заполняемость номеров</div>
                    </div>
                  </div>
                </LiquidGlass>
              </Tilt>
            </div>
            <div className="md:col-span-7 grid gap-6 sm:grid-cols-3">
              {[ 
                { icon:<Users className="h-6 w-6"/>, label:'Гостей за месяц', value:'2 340' },
                { icon:<BedDouble className="h-6 w-6"/>, label:'Средн. цена номера', value:'8 900 ₽' },
                { icon:<Star className="h-6 w-6 text-amber-300"/>, label:'Рейтинг', value:<span className="flex items-center gap-1">4.8 <Star className="h-5 w-5 fill-amber-300 text-amber-300"/></span> },
              ].map((k,i)=>(
                <Tilt key={i}>
                  <LiquidGlass className="p-6 rounded-[28px]">
                    <div className="flex items-center gap-3">
                      {k.icon}
                      <div className="text-sm text-white/75">{k.label}</div>
                    </div>
                    <div className="mt-2 text-3xl font-extrabold">{k.value}</div>
                  </LiquidGlass>
                </Tilt>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4">
          <Tilt>
            <LiquidGlass className="mx-auto max-w-4xl p-0 rounded-[28px]">
              <div className="p-8 md:p-12 text-center">
                <h2 className="text-2xl font-bold uppercase tracking-wider">Уже забронировали стол?</h2>
                <p className="mt-4 text-white/80 uppercase tracking-wider">
                  Найдите свою бронь или{" "}
                  <span className="bg-amber-400 text-black px-2 py-0.5 rounded-md ml-1.5">измените детали</span>
                </p>
                <div className="mt-8">
                  <Link href="/booking/search">
                    <Button
                      size="lg"
                      className="rounded-2xl bg-amber-400 text-black hover:bg-amber-300 shadow-[0_12px_28px_rgba(255,184,74,.45)] transition-transform hover:scale-105"
                    >
                      <Search className="mr-3 h-6 w-6" />
                      НАЙТИ БРОНЬ
                    </Button>
                  </Link>
                </div>
              </div>
            </LiquidGlass>
          </Tilt>
        </section>

        {/* Футер */}
        <footer className="px-4 pb-12">
          <Tilt>
            <LiquidGlass className="mx-auto max-w-5xl p-5 rounded-[28px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white/75">
                <Clock4 className="h-5 w-5" />
                Ежедневно 10:00–23:00
              </div>
              <div className="text-white/70">© 2012–2025 • Fine Dining</div>
            </div>
          </LiquidGlass>
          </Tilt>
        </footer>
      </div>

      {/* ===== SVG filter (как в эталоне) ===== */}
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

      {/* ===== Глобальные стили Liquid Glass (1:1) ===== */}
      <style jsx global>{`
        .liquidGlass-wrapper {
          position: relative;
          display: block;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
        }
        .liquidGlass-effect {
          position: absolute;
          inset: 0;
          z-index: 0;
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          filter: url(#glass-distortion);
          overflow: hidden;
          isolation: isolate;
        }
        .liquidGlass-tint {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: rgba(255, 255, 255, 0.25);
        }
        .liquidGlass-shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5),
            inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5);
          border-radius: inherit;
        }
        .liquidGlass-text {
          position: relative;
          z-index: 3;
          color: white; /* мы на тёмном фоне */
        }
        /* лёгкая hover-динамика для крупных блоков */
        .liquidGlass-wrapper:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </main>
  );
}