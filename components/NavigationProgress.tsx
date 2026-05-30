'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';

function ProgressBar() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = useRef(false);

  const start = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    isActive.current = true;

    setOpacity(1);
    setWidth(8);

    let w = 8;
    intervalRef.current = setInterval(() => {
      // Increments get smaller as we approach 85 — feels organic
      const step = Math.random() * 12 * (1 - w / 100);
      w = Math.min(w + step, 85);
      setWidth(w);
      if (w >= 85) clearInterval(intervalRef.current!);
    }, 350);
  };

  const complete = () => {
    if (!isActive.current) return;
    isActive.current = false;

    if (intervalRef.current) clearInterval(intervalRef.current);

    setWidth(100);
    hideTimer.current = setTimeout(() => {
      setOpacity(0);
      resetTimer.current = setTimeout(() => setWidth(0), 300);
    }, 200);
  };

  // Complete bar when pathname changes (navigation finished)
  useEffect(() => {
    complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Intercept link clicks to start the bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Same page with only hash change — skip
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
        start();
      } catch {
        // unparseable href — ignore
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${width}%`,
        background: 'linear-gradient(90deg, #FD0001, #ff4444)',
        boxShadow: opacity > 0 ? '0 0 8px rgba(253,0,1,0.6)' : 'none',
        zIndex: 9999,
        pointerEvents: 'none',
        transition: `width ${width === 100 ? '0.25s' : '0.4s'} ease, opacity 0.3s ease`,
        opacity,
      }}
    />
  );
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
