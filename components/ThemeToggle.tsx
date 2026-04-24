'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('wa_theme');
    const isDark = saved !== 'light';
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('wa_theme', next ? 'dark' : 'light');
  }

  return (
    <button onClick={toggle}
      className="p-2 rounded-xl border transition-all hover:opacity-80"
      style={{ borderColor: 'var(--border)', color: 'var(--text2)', background: 'var(--bg3)' }}
      title={dark ? 'Light mode' : 'Dark mode'}>
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
