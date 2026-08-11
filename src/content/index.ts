import { chapterSchema, type Chapter } from './schema';
import ch01 from './chapters/ch01';

/**
 * The chapter registry. Every chapter module is zod-parsed at load time so a
 * malformed content module fails loudly (and in dev, immediately) instead of
 * rendering blank on the learner's phone. Defaults are applied by the parse.
 */
export const chapters: Chapter[] = [ch01].map((raw) => chapterSchema.parse(raw));

export function findChapter(id: string): Chapter | undefined {
  return chapters.find((c) => c.id === id);
}
