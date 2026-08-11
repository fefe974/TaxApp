import { useEffect, useState } from 'preact/hooks';
import { recordLocation } from './storage';

/* Hand-rolled hash router — GitHub Pages project sites cannot rewrite paths,
   so all navigation lives after the '#'. */

export type Route =
  | { view: 'home' }
  | { view: 'chapter'; chapterId: string }
  | { view: 'lesson'; chapterId: string; section: number }
  | { view: 'practice'; chapterId: string; setId: string; problem: number };

export function parseHash(hash: string): Route {
  const parts = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean);
  if (parts[0] === 'chapter' && parts[1]) {
    const chapterId = parts[1];
    if (parts[2] === 'lesson' && parts[3] !== undefined) {
      const section = parseInt(parts[3], 10);
      return {
        view: 'lesson',
        chapterId,
        section: Number.isNaN(section) || section < 0 ? 0 : section,
      };
    }
    if (parts[2] === 'practice' && parts[3]) {
      const problem = parts[4] !== undefined ? parseInt(parts[4], 10) : 0;
      return {
        view: 'practice',
        chapterId,
        setId: parts[3],
        problem: Number.isNaN(problem) || problem < 0 ? 0 : problem,
      };
    }
    return { view: 'chapter', chapterId };
  }
  return { view: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.view) {
    case 'home':
      return '#/';
    case 'chapter':
      return `#/chapter/${route.chapterId}`;
    case 'lesson':
      return `#/chapter/${route.chapterId}/lesson/${route.section}`;
    case 'practice':
      return `#/chapter/${route.chapterId}/practice/${route.setId}/${route.problem}`;
  }
}

export function navigate(hash: string): void {
  location.hash = hash;
}

/** Persist as "resume point" only locations worth resuming to. */
function maybeRecord(hash: string): void {
  const route = parseHash(hash);
  if (route.view === 'lesson' || route.view === 'practice') {
    recordLocation(hash);
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));

  useEffect(() => {
    maybeRecord(location.hash);
    const onChange = () => {
      setRoute(parseHash(location.hash));
      maybeRecord(location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
