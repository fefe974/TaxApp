# Skills

Skills vendored into this repo so lesson authoring and UI work follow the same
playbook in every session. Claude Code loads them automatically from
`.claude/skills/`.

## What's here

| Skill | Use it for | Upstream |
|-------|-----------|----------|
| `lesson-builder` | Building a lesson: the meeting arc, lecture notes, active-learning beats, discussion guides, cases | [yujxzjcn/teaching-skills](https://github.com/yujxzjcn/teaching-skills) |
| `course-designer` | Course-level design: outcomes, the schedule, the syllabus — run before building lessons | same |
| `assessment-architect` | Graded instruments: exams, quizzes, rubrics, project briefs | same |
| `ui-ux-pro-max` | Any visual/interaction work: palettes, typography, layout, accessibility audits | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |

Both upstreams are MIT-licensed; their `LICENSE` files travel with the copied
directories. Vendored at the commit checked out on 2026-08-10 — to update, re-copy
from upstream rather than editing in place.

## Using them here

`lesson-builder` expects a course design as input, and its five-part arc
(activation → segmented input → active processing → check → closure) is what
Lesson 1 of the Governmental Accounting app is built on. When adding Lesson 2+,
follow the same shape: an activation prompt the lesson resolves, one processing
beat per input segment, the knowledge check, then a closure the reader always
reaches. The lesson data structure in `governmental-accounting/index.html`
already has slots for each — `activation`, `check`, and the closure panel.

`ui-ux-pro-max` ships a searchable database and a Python search tool (stdlib
only, no network):

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product> <industry>" --design-system
```

Two notes from using it on this project:

- `--design-system` routes on keywords, and "education" pulls it toward
  children's apps (Claymorphism, Comic Neue). For an adult professional course,
  query the specific domains — `typography`, `ux`, `color` — rather than taking
  the generated style wholesale.
- Its font recommendations assume a Google Fonts CDN link. This app is also
  published as a Claude Artifact, where a strict CSP blocks external font hosts,
  so any webfont must be inlined as a `@font-face` data URI instead.
