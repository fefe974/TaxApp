import { useState } from 'preact/hooks';
import type { KnowledgeCheck } from '../content/schema';
import { getCheckAnswer, recordCheckAnswer } from '../lib/storage';

const LETTERS = 'ABCDEFGH';

interface Props {
  check: KnowledgeCheck;
  chapterId: string;
  sectionId: string;
  slot: 'activation' | 'check';
}

/**
 * An active-learning beat: activation prediction or inline knowledge check.
 * Immediate explanatory feedback after answering; never gates navigation.
 * The answer is persisted so revisiting a section shows the resolved state.
 */
export function CheckBeat({ check, chapterId, sectionId, slot }: Props) {
  const saved = getCheckAnswer(chapterId, sectionId, slot);
  const [picked, setPicked] = useState<number | null>(saved ? saved.choice : null);
  const answered = picked !== null;

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    recordCheckAnswer(chapterId, sectionId, slot, i, i === check.answer);
  };

  const right = answered && picked === check.answer;

  return (
    <div class="ga-turn">
      <div class="ga-turn-head">
        <span class="ga-turn-tag ga-mono">{check.tag}</span>
        <span class="ga-turn-time ga-mono">{check.time}</span>
      </div>
      <p class="ga-turn-q">{check.prompt}</p>
      <div class="ga-turn-opts">
        {check.choices.map((choice, i) => {
          const cls =
            answered && i === check.answer
              ? 'ga-choice ga-correct'
              : answered && i === picked
                ? 'ga-choice ga-wrong'
                : 'ga-choice';
          return (
            <button type="button" class={cls} key={i} disabled={answered} onClick={() => pick(i)}>
              <span class="ga-choice-letter" aria-hidden="true">
                {LETTERS[i]}
              </span>
              <span class="ga-choice-text">{choice}</span>
              <span class="ga-choice-mark" aria-hidden="true">
                {answered && i === check.answer ? '✓' : answered && i === picked ? '✗' : ''}
              </span>
            </button>
          );
        })}
      </div>
      <div class="ga-turn-fb" role="status">
        {answered && (
          <>
            <b class={right ? 'ga-fb-y' : 'ga-fb-n'}>{right ? 'That is it.' : 'Not quite.'}</b>
            <span dangerouslySetInnerHTML={{ __html: check.explain }} />
          </>
        )}
      </div>
    </div>
  );
}
