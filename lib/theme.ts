export function getTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('wa_theme') as 'dark' | 'light') || 'dark';
}

export function setTheme(theme: 'dark' | 'light') {
  localStorage.setItem('wa_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme() {
  const t = getTheme();
  document.documentElement.setAttribute('data-theme', t);
}
