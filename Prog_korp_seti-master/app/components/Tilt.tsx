'use client';

import { useRef, useState } from "react";

export function Tilt({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setTilt({ rx: -y * 6, ry: x * 8 });
      }}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      className={`[transform-style:preserve-3d] transition-transform duration-200 ${className}`}
      style={{ transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
    >
      {children}
    </div>
  );
}
