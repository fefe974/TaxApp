import type { Chapter } from '../content/schema';

/** Placeholder — the full lesson renderer lands with the next commit. */
export function LessonView({ chapter }: { chapter: Chapter; section: number }) {
  return (
    <div class="ga-shell ga-with-rail">
      <main>
        <div class="ga-view">
          <p class="ga-lead">Lesson renderer coming up for “{chapter.title}”.</p>
        </div>
      </main>
    </div>
  );
}
