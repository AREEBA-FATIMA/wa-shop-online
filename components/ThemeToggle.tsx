'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const KEY = 'wa_theme';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as 'dark' | 'light' | null) || 'light';
    const isDark = saved === 'dark';
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    try { localStorage.setItem(KEY, next ? 'dark' : 'light'); } catch {}
  }

  return (
    <button onClick={toggle}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
      style={{ background: 'var(--bg3)', color: 'var(--text2)' }}
      aria-label="Toggle light or dark theme" title="Theme">
      {dark ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
    </button>
  );
}
