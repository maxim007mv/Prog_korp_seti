import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { UtensilsCrossed, Calendar, Menu, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative min-h-screen text-black font-mono">
      {/* Декоративные элементы фона */}
      <div className="fixed top-10 left-10 w-16 h-16 bg-red-500 border-4 border-black z-0"></div>
      <div className="fixed top-20 right-20 w-12 h-12 bg-yellow-400 border-3 border-black rotate-45 z-0"></div>
      <div className="fixed bottom-32 left-1/4 w-20 h-8 bg-black z-0"></div>

      {/* BG: фото + жёсткий оверлей для контраста */}
      <section className="bg-hero relative">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/ambient/leaves.jpg"
            alt=""
            fill
            className="object-cover brightness-[.38] contrast-[1.25] saturate-[1.1]"
            priority
          />
          {/* плотное затемнение для читаемости */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* HERO-панель */}
        <div className="container-custom py-24 perspective-container">
          <div className="mx-auto max-w-4xl card-brutal brutal-decoration card-3d depth-shadow">
            <div className="text-center relative">
              {/* Декоративный элемент */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 border-2 border-black rotate-12 element-3d"></div>

              <span className="inline-block border-4 border-black bg-yellow-400 px-6 py-2 text-sm font-black uppercase tracking-widest text-black brutal-stripe">
                ⚠ FINE DINING • SINCE 2012 ⚠
              </span>
              <h1 className="text-brutal text-black mt-8 text-5xl font-black tracking-tight md:text-7xl uppercase leading-none">
                ДОБРО ПОЖАЛОВАТЬ<br/>
                <span className="text-brutal-outline bg-black px-2">В НАШ РЕСТОРАН</span>
              </h1>
              <p className="text-black mx-auto mt-6 max-w-3xl text-xl font-black uppercase tracking-wider leading-tight">
                ИЗЫСКАННАЯ КУХНЯ И СЕРВИС.<br/>
                БРУТАЛИСТСКИЙ ДИЗАЙН —<br/>
                <span className="bg-red-500 text-white px-2 border-2 border-black">ФУНКЦИОНАЛЬНО И ЧИТАЕМО</span>
              </p>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                <Link href="/booking">
                  <Button size="lg" className="btn-primary brutal-accent">
                    <Calendar className="mr-3 h-6 w-6" />
                    ЗАБРОНИРОВАТЬ СТОЛ
                  </Button>
                </Link>
                <Link href="/menu">
                  <button className="btn-ghost brutal-decoration">
                    <Menu className="mr-3 h-6 w-6" />
                    ПОСМОТРЕТЬ МЕНЮ
                  </button>
                </Link>
              </div>

              {/* Дополнительный декоративный элемент */}
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-red-500 border-3 border-black -rotate-12 element-3d"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Фичи — бруталистские карточки */}
      <section className="py-14 perspective-container">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-brutal text-black text-4xl font-black uppercase tracking-tight brutal-stripe">
              НАШИ ОСОБЕННОСТИ
            </h2>
            <p className="text-black mt-4 text-xl font-black uppercase tracking-wider">
              ЧТО ДЕЛАЕТ НАС <span className="bg-red-500 text-white px-2 border-2 border-black">УНИКАЛЬНЫМИ</span>
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: <UtensilsCrossed className="h-8 w-8" />, title: 'ИЗЫСКАННАЯ КУХНЯ', text: 'СВЕЖИЕ ПРОДУКТЫ И АВТОРСКИЕ РЕЦЕПТЫ' },
              { icon: <Calendar className="h-8 w-8" />, title: 'УДОБНОЕ БРОНИРОВАНИЕ', text: 'ДАТА, ВРЕМЯ И ГОСТИ — ЗА ПАРУ КЛИКОВ' },
              { icon: <Menu className="h-8 w-8" />, title: 'РАЗНООБРАЗНОЕ МЕНЮ', text: 'ОТ КЛАССИКИ ДО ДЕГУСТАЦИОННЫХ СЕТОВ' },
            ].map((f, i) => (
              <div key={i} className="card-brutal brutal-decoration relative group card-3d depth-shadow">
                {/* Декоративные элементы */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 border-2 border-black rotate-12 element-3d"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-red-500 border-2 border-black -rotate-45 element-3d"></div>

                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center border-4 border-black bg-black text-white brutal-accent">
                  {f.icon}
                </div>
                <h3 className="text-black mb-2 text-xl font-black uppercase tracking-wider brutal-stripe">{f.title}</h3>
                <p className="text-black font-bold">{f.text}</p>

                {/* Дополнительный декоративный элемент при наведении */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-red-500 border border-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Быстрое бронирование — бруталистский стиль */}
      <section className="pb-16 perspective-container">
        <div className="container-custom mx-auto max-w-3xl card-brutal brutal-decoration card-3d depth-shadow">
          <div className="relative">
            {/* Декоративные элементы */}
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-400 border-2 border-black rotate-45 element-3d"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 border-2 border-black -rotate-12 element-3d"></div>

            <h2 className="text-brutal text-black mb-8 text-center text-3xl font-black uppercase tracking-wider brutal-stripe">
              БЫСТРОЕ БРОНИРОВАНИЕ
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="relative">
                <label className="label brutal-accent">ДАТА</label>
                <input type="date" className="input brutal-decoration" />
              </div>
              <div className="relative">
                <label className="label brutal-accent">ВРЕМЯ</label>
                <input type="time" className="input brutal-decoration" />
              </div>
              <div className="relative">
                <label className="label brutal-accent">КОЛИЧЕСТВО ГОСТЕЙ</label>
                <input type="number" min={1} max={20} defaultValue={2} className="input brutal-decoration" />
              </div>
              <div className="flex items-end relative">
                <Link href="/booking" className="w-full">
                  <Button className="w-full btn-primary brutal-accent">
                    <Search className="mr-2 h-5 w-5" />
                    НАЙТИ СТОЛ
                  </Button>
                </Link>
                {/* Декоративный элемент */}
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 border-2 border-black rotate-45"></div>
              </div>
            </div>

            {/* Дополнительный декоративный элемент */}
            <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-black border-2 border-red-500 rotate-12 element-3d"></div>
          </div>
        </div>
      </section>

      {/* Поиск брони */}
      <section className="pb-24 perspective-container">
        <div className="container-custom card-brutal brutal-decoration text-center relative card-3d depth-shadow">
          {/* Декоративные элементы */}
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 border-2 border-black rotate-45 element-3d"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-400 border-2 border-black -rotate-12 element-3d"></div>

          <h2 className="text-brutal text-black text-2xl font-black uppercase tracking-wider brutal-stripe">
            УЖЕ ЗАБРОНИРОВАЛИ СТОЛ?
          </h2>
          <p className="mt-4 text-black font-black uppercase tracking-wider">
            НАЙДИТЕ СВОЮ БРОНЬ ИЛИ <span className="bg-yellow-400 text-black px-2 border-2 border-black">ИЗМЕНИТЕ ДЕТАЛИ</span>
          </p>
          <div className="mt-8">
            <Link href="/booking/search">
              <button className="btn-ghost brutal-accent">
                <Search className="mr-3 h-6 w-6" />
                НАЙТИ МОЮ БРОНЬ
              </button>
            </Link>
          </div>

          {/* Дополнительный декоративный элемент */}
          <div className="absolute top-6 left-6 w-3 h-3 bg-black border border-red-500 rotate-45 element-3d"></div>
        </div>
      </section>
    </main>
  );
}