'use client';
import { useT } from '@/contexts/LangContext';
import { LANGS, Lang } from '@/lib/translations';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useT();
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg"
      style={{ background: 'var(--bg3)', border: '0.5px solid var(--border)' }}>
      {LANGS.map((l) => {
        const active = lang === l.code;
        return (
          <button key={l.code} onClick={() => setLang(l.code as Lang)}
            aria-pressed={active}
            title={l.label}
            className="px-2 py-1 rounded-md text-xs font-semibold transition-all"
            style={{
              background: active ? 'var(--green)' : 'transparent',
              color: active ? '#fff' : 'var(--text2)',
              minWidth: compact ? 28 : 34,
            }}>
            {compact ? l.short : l.label}
          </button>
        );
      })}
    </div>
  );
}
