import { progress } from '../lib/storage';
import { cycleTheme } from '../lib/theme';
import { navigate } from '../lib/router';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/** Half-filled circle = "follow the system". */
function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TopBar() {
  const theme = progress.value.theme;
  const label =
    theme === 'system'
      ? 'Theme: system. Switch to light.'
      : theme === 'light'
        ? 'Theme: light. Switch to dark.'
        : 'Theme: dark. Switch to system.';

  return (
    <header class="ga-topbar">
      <div class="ga-topbar-inner">
        <button type="button" class="ga-brand" onClick={() => navigate('#/')}>
          <span class="ga-mark" aria-hidden="true">GA</span>
          <span>
            <span class="ga-brand-text">Governmental Accounting</span>
            <span class="ga-brand-sub">County Accountant Trainer</span>
          </span>
        </button>
        <button type="button" class="ga-icon-btn" aria-label={label} title={label} onClick={() => cycleTheme()}>
          {theme === 'light' ? <SunIcon /> : theme === 'dark' ? <MoonIcon /> : <SystemIcon />}
        </button>
      </div>
    </header>
  );
}
