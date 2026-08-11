import type { Chapter } from '../content/schema';
import { isSectionComplete, getProblemRecord } from '../lib/storage';
import { navigate } from '../lib/router';

/** Chapter overview: jump into the lesson or a practice set. */
export function ChapterView({ chapter }: { chapter: Chapter }) {
  const doneCount = chapter.sections.filter((s) =>
    isSectionComplete(chapter.id, s.id),
  ).length;
  const firstIncomplete = chapter.sections.findIndex(
    (s) => !isSectionComplete(chapter.id, s.id),
  );
  const resumeSection = firstIncomplete === -1 ? 0 : firstIncomplete;
  const visibleSets = chapter.practiceSets.filter((s) => !s.hidden);

  return (
    <div class="ga-view">
      <p class="ga-section-kicker ga-mono">
        Chapter {chapter.number} · {chapter.bookAlignment}
      </p>
      <h2>{chapter.title}</h2>
      <p class="ga-lead">{chapter.blurb}</p>

      <div class="ga-section-nav" style={{ borderTop: 0, paddingTop: 0, marginTop: 0, position: 'static' }}>
        <button
          type="button"
          class="ga-btn ga-btn-primary"
          onClick={() => navigate(`#/chapter/${chapter.id}/lesson/${resumeSection}`)}
        >
          {doneCount === 0
            ? 'Start the lesson →'
            : doneCount === chapter.sections.length
              ? 'Review the lesson →'
              : 'Continue the lesson →'}
        </button>
      </div>

      <h3>Lesson sections</h3>
      <div class="ga-rail-list" style={{ margin: '12px 0 8px' }}>
        {chapter.sections.map((section, i) => {
          const done = isSectionComplete(chapter.id, section.id);
          return (
            <button
              type="button"
              class="ga-rail-item"
              style={{ display: 'flex', minHeight: '44px', alignItems: 'center' }}
              data-state={done ? 'done' : 'todo'}
              key={section.id}
              onClick={() => navigate(`#/chapter/${chapter.id}/lesson/${i}`)}
            >
              <span class="ga-rail-num">{done ? '✓' : i + 1}</span>
              <span>{section.short}</span>
            </button>
          );
        })}
      </div>

      {visibleSets.length > 0 && <h3>Practice</h3>}
      {visibleSets.map((set) => {
        const solved = set.problems.filter(
          (p) => getProblemRecord(chapter.id, set.id, p.id)?.solved,
        ).length;
        return (
          <button
            type="button"
            class="ga-lesson-card"
            key={set.id}
            onClick={() => navigate(`#/chapter/${chapter.id}/practice/${set.id}/0`)}
          >
            <span class="ga-card-meta ga-mono">
              <span class="ga-card-lo">Practice</span>
              <span>
                {set.problems.length} problem{set.problems.length === 1 ? '' : 's'}
              </span>
              <span>·</span>
              <span>
                {solved}/{set.problems.length} solved
              </span>
            </span>
            <h2>{set.title}</h2>
            {set.blurb && <p>{set.blurb}</p>}
            <span class="ga-card-foot">
              <span class="ga-card-status">
                {solved === set.problems.length ? 'All solved · retry any time' : 'Work the set'}
              </span>
              <span class="ga-card-go" aria-hidden="true">
                →
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
