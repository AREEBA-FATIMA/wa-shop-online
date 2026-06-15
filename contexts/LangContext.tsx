'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { t as translate, getLang } from '@/lib/translations';

interface LangContextType {
  lang: string;
  setLang: (l: string) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    setLangState(getLang());

    // Listen for language changes from settings page
    const handler = () => setLangState(getLang());
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  const setLang = useCallback((l: string) => {
    setLangState(l);
    try {
      const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
      u.language = l;
      localStorage.setItem('wa_user', JSON.stringify(u));
    } catch {}
    window.dispatchEvent(new Event('langchange'));
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string>) => {
    return translate(key, lang, vars);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
