'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { t as translate, getLang, setLangStore, getDir, Lang } from '@/lib/translations';

interface LangContextType {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'roman_ur',
  dir: 'ltr',
  setLang: () => {},
  t: (key: string) => key,
});

function applyDir(l: Lang) {
  if (typeof document === 'undefined') return;
  const dir = getDir(l);
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', l === 'ur' ? 'ur' : 'en');
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('roman_ur');

  useEffect(() => {
    const l = getLang();
    setLangState(l);
    applyDir(l);
    const handler = () => { const nl = getLang(); setLangState(nl); applyDir(nl); };
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setLangStore(l);
    applyDir(l);
    // keep the logged-in user's language in sync (so AI replies use it too)
    try {
      const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
      if (u && typeof u === 'object') { u.language = l; localStorage.setItem('wa_user', JSON.stringify(u)); }
    } catch {}
    window.dispatchEvent(new Event('langchange'));
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string>) => translate(key, lang, vars), [lang]);

  return (
    <LangContext.Provider value={{ lang, dir: getDir(lang), setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
