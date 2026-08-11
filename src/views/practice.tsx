import type { Chapter } from '../content/schema';

/** Placeholder — the JE practice engine lands with an upcoming commit. */
export function PracticeView({ chapter }: { chapter: Chapter; setId: string; problem: number }) {
  return (
    <div class="ga-view">
      <p class="ga-lead">Practice engine coming up for “{chapter.title}”.</p>
    </div>
  );
}
