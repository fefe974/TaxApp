import { useEffect } from 'preact/hooks';
import type { Chapter } from '../content/schema';
import { isSectionComplete, markSectionComplete } from '../lib/storage';
import { navigate } from '../lib/router';
import { CheckBeat } from '../components/check-beat';

function stepState(i: number, current: number, done: boolean): string {
  if (i === current) return 'current';
  return done || i < current ? 'done' : 'todo';
}

/** Lesson renderer: mobile stepper + desktop rail + section content. */
export function LessonView({ chapter, section }: { chapter: Chapter; section: number }) {
  const total = chapter.sections.length;
  const idx = Math.min(Math.max(section, 0), total - 1);
  const sec = chapter.sections[idx];
  const pct = Math.round(((idx + 1) / total) * 100);

  const goTo = (i: number) => navigate(`#/chapter/${chapter.id}/lesson/${i}`);

  const goNext = () => {
    markSectionComplete(chapter.id, sec.id);
    if (idx === total - 1) {
      navigate(`#/chapter/${chapter.id}`);
    } else {
      goTo(idx + 1);
    }
  };
  const goPrev = () => {
    if (idx === 0) {
      navigate(`#/chapter/${chapter.id}`);
    } else {
      goTo(idx - 1);
    }
  };

  useEffect(() => {
    document.title = `${chapter.title} — ${sec.short}`;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = ((e.target as HTMLElement | null)?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'ArrowRight' && idx < total - 1) goTo(idx + 1);
      else if (e.key === 'ArrowLeft' && idx > 0) goTo(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chapter.id, idx, total]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Mobile stepper — sticky under the top bar */}
      <div class="ga-stepper">
        <div class="ga-stepper-inner">
          <div class="ga-seg">
            {chapter.sections.map((s, i) => (
              <button
                type="button"
                key={s.id}
                data-state={stepState(i, idx, isSectionComplete(chapter.id, s.id))}
                aria-label={`Go to ${s.short}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <div class="ga-step-label ga-mono">
            <b>{sec.short}</b>
            <span>
              {idx + 1} / {total}
            </span>
          </div>
        </div>
      </div>

      <div class="ga-shell ga-with-rail">
        {/* Desktop rail */}
        <nav class="ga-rail" aria-label="Lesson sections">
          <p class="ga-rail-lo ga-mono">
            Ch. {chapter.number} · Lesson
          </p>
          <p class="ga-rail-title">{chapter.title}</p>
          <div class="ga-rail-meter">
            <span class="ga-rail-track">
              <span class="ga-rail-fill" style={{ width: `${pct}%` }} />
            </span>
            <span class="ga-rail-pct">{pct}%</span>
          </div>
          <div class="ga-rail-list">
            {chapter.sections.map((s, i) => {
              const done = isSectionComplete(chapter.id, s.id);
              return (
                <button
                  type="button"
                  class="ga-rail-item"
                  key={s.id}
                  data-state={stepState(i, idx, done)}
                  onClick={() => goTo(i)}
                >
                  <span class="ga-rail-num">{done && i !== idx ? '✓' : i + 1}</span>
                  <span>{s.short}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <main>
          <div class="ga-view" key={sec.id}>
            <article>
              <p class="ga-section-kicker ga-mono">
                Ch. {chapter.number} · {sec.kicker}
              </p>
              <h2 dangerouslySetInnerHTML={{ __html: sec.title }} />
              {sec.activation && (
                <CheckBeat
                  check={sec.activation}
                  chapterId={chapter.id}
                  sectionId={sec.id}
                  slot="activation"
                />
              )}
              <div dangerouslySetInnerHTML={{ __html: sec.html.join('\n') }} />
              {sec.knowledgeCheck && (
                <CheckBeat
                  check={sec.knowledgeCheck}
                  chapterId={chapter.id}
                  sectionId={sec.id}
                  slot="check"
                />
              )}
            </article>

            {/* Sticky bottom section nav on mobile */}
            <div class="ga-section-nav">
              <button type="button" class="ga-btn" onClick={goPrev}>
                {idx === 0 ? '← Chapter home' : '← Previous'}
              </button>
              <button type="button" class="ga-btn ga-btn-primary" onClick={goNext}>
                {idx === total - 1 ? 'Finish lesson →' : 'Next section →'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
