'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button onClick={toggle}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
      style={{ background: 'var(--bg3)', color: 'var(--text2)' }}
      aria-label="Toggle theme">
      {dark ? <Sun size={13} strokeWidth={2} /> : <Moon size={13} strokeWidth={2} />}
    </button>
  );
}
