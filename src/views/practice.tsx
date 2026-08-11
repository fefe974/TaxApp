import { useEffect } from 'preact/hooks';
import type { Chapter, Problem } from '../content/schema';
import { navigate } from '../lib/router';
import { getProblemRecord } from '../lib/storage';
import { JournalEntryEngine } from '../problems/journal-entry';

function ProblemBody({
  problem,
  chapterId,
  setId,
}: {
  problem: Problem;
  chapterId: string;
  setId: string;
}) {
  if (problem.type === 'journal-entry') {
    return <JournalEntryEngine problem={problem} chapterId={chapterId} setId={setId} />;
  }
  // classification / reconciliation / multi-part engines arrive in Phase 2.
  return (
    <div class="ga-je-missing" style={{ marginTop: '18px' }}>
      This problem type ({problem.type}) is coming in a later update.
    </div>
  );
}

/** Practice-set runner: one problem per screen with prev/next navigation. */
export function PracticeView({
  chapter,
  setId,
  problem,
}: {
  chapter: Chapter;
  setId: string;
  problem: number;
}) {
  const set = chapter.practiceSets.find((s) => s.id === setId)!;
  const total = set.problems.length;
  const idx = Math.min(Math.max(problem, 0), total - 1);
  const current = set.problems[idx];
  const record = getProblemRecord(chapter.id, setId, current.id);

  useEffect(() => {
    document.title = `${set.title} — Problem ${idx + 1}`;
  }, [set.title, idx]);

  const goTo = (i: number) => navigate(`#/chapter/${chapter.id}/practice/${setId}/${i}`);

  return (
    <div class="ga-view" key={current.id}>
      <p class="ga-section-kicker ga-mono">
        Ch. {chapter.number} · {set.title}
      </p>
      <p class="ga-problem-progress ga-mono">
        Problem {idx + 1} of {total}
        {record && record.attempts > 0 && (
          <>
            {' '}
            · best {Math.round(record.bestScore * 100)}% · {record.attempts} attempt
            {record.attempts === 1 ? '' : 's'}
          </>
        )}
      </p>
      <h2>{current.title}</h2>
      <div
        class="ga-je-scenario"
        dangerouslySetInnerHTML={{ __html: `<p>${current.scenario}</p>` }}
      />

      <ProblemBody problem={current} chapterId={chapter.id} setId={setId} />

      <div class="ga-section-nav">
        <button
          type="button"
          class="ga-btn"
          onClick={() => (idx === 0 ? navigate(`#/chapter/${chapter.id}`) : goTo(idx - 1))}
        >
          {idx === 0 ? '← Chapter home' : '← Previous'}
        </button>
        <button
          type="button"
          class="ga-btn ga-btn-primary"
          onClick={() =>
            idx === total - 1 ? navigate(`#/chapter/${chapter.id}`) : goTo(idx + 1)
          }
        >
          {idx === total - 1 ? 'Finish set →' : 'Next problem →'}
        </button>
      </div>
    </div>
  );
}
