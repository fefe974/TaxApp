import { effect } from '@preact/signals';
import { progress, setTheme, type ThemePref } from './storage';

/* Three-state theme: system → light → dark → system. 'system' removes the
   data-theme stamp so the prefers-color-scheme token blocks resolve. */

const ORDER: ThemePref[] = ['system', 'light', 'dark'];

export function applyTheme(theme: ThemePref): void {
  const el = document.documentElement;
  if (theme === 'system') {
    el.removeAttribute('data-theme');
  } else {
    el.setAttribute('data-theme', theme);
  }
}

export function cycleTheme(): ThemePref {
  const current = progress.value.theme;
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  setTheme(next);
  return next;
}

/** Keep the DOM stamped in sync with the persisted preference. */
export function initTheme(): void {
  effect(() => applyTheme(progress.value.theme));
}
