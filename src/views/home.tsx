import { chapters, findChapter } from '../content';
import type { Chapter } from '../content/schema';
import { progress, isSectionComplete, getProblemRecord } from '../lib/storage';
import { navigate, parseHash } from '../lib/router';

function chapterSectionPct(chapter: Chapter): number {
  const done = chapter.sections.filter((s) => isSectionComplete(chapter.id, s.id)).length;
  return Math.round((done / chapter.sections.length) * 100);
}

function chapterSolvedCount(chapter: Chapter): { solved: number; total: number } {
  let solved = 0;
  let total = 0;
  for (const set of chapter.practiceSets) {
    if (set.hidden) continue;
    for (const p of set.problems) {
      total += 1;
      if (getProblemRecord(chapter.id, set.id, p.id)?.solved) solved += 1;
    }
  }
  return { solved, total };
}

function ResumeCard() {
  const last = progress.value.lastLocation;
  if (!last) return null;
  const route = parseHash(last);
  if (route.view !== 'lesson' && route.view !== 'practice') return null;
  const chapter = findChapter(route.chapterId);
  if (!chapter) return null;

  let where: string;
  if (route.view === 'lesson') {
    const section = chapter.sections[Math.min(route.section, chapter.sections.length - 1)];
    where = section ? `Lesson — ${section.short}` : 'Lesson';
  } else {
    const set = chapter.practiceSets.find((s) => s.id === route.setId);
    where = set ? `Practice — ${set.title}` : 'Practice';
  }

  return (
    <button type="button" class="ga-resume" onClick={() => navigate(last)}>
      <span class="ga-callout-tag ga-mono">Pick up where you left off</span>
      <strong>
        Chapter {chapter.number}: {chapter.title}
      </strong>
      <p>{where} · tap to resume</p>
    </button>
  );
}

export function HomeView() {
  return (
    <div class="ga-view">
      <div class="ga-hero">
        <p class="ga-section-kicker ga-mono">Course home</p>
        <h2>Learn the county's books, one chapter at a time</h2>
        <p class="ga-lead">
          Short example-first lessons, instant knowledge checks, and graded journal-entry
          practice — built around the duties of a county Accountant I.
        </p>
      </div>

      <ResumeCard />

      {chapters.map((chapter) => {
        const pct = chapterSectionPct(chapter);
        const { solved, total } = chapterSolvedCount(chapter);
        const status =
          pct === 0
            ? 'Start chapter'
            : pct === 100 && solved === total && total > 0
              ? 'Complete · revisit any time'
              : 'In progress — resume where you left off';
        return (
          <button
            type="button"
            class="ga-lesson-card"
            key={chapter.id}
            onClick={() => navigate(`#/chapter/${chapter.id}`)}
          >
            <span class="ga-card-meta ga-mono">
              <span class="ga-card-lo">Ch. {chapter.number}</span>
              <span>{chapter.sections.length} sections</span>
              <span>·</span>
              <span>{chapter.minutes} min</span>
              {total > 0 && (
                <>
                  <span>·</span>
                  <span>
                    {solved}/{total} problems solved
                  </span>
                </>
              )}
            </span>
            <h2>{chapter.title}</h2>
            <p>{chapter.blurb}</p>
            <span class="ga-card-meter">
              <span class="ga-card-track">
                <span class="ga-card-fill" style={{ width: `${pct}%` }} />
              </span>
              <span class="ga-card-pct">{pct}%</span>
            </span>
            <span class="ga-card-foot">
              <span class="ga-card-status">{status}</span>
              <span class="ga-card-go" aria-hidden="true">
                →
              </span>
            </span>
          </button>
        );
      })}

      <div class="ga-lesson-card ga-locked">
        <span class="ga-card-meta ga-mono">
          <span class="ga-card-lo">Coming soon</span>
          <span>Chapter 2</span>
        </span>
        <h2>Principles and the fund model</h2>
        <p>
          Funds, fund categories, and the measurement focus behind every entry you will make —
          built on the foundation in Chapter 1.
        </p>
      </div>
    </div>
  );
}
