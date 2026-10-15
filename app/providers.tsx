'use client';
import { ReactNode } from 'react';
import { LangProvider } from '@/contexts/LangContext';

export default function Providers({ children }: { children: ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
