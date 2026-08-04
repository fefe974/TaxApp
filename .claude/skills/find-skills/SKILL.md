---
name: find-skills
description: Find which skills apply to a task by searching what every installed skill actually does, not what it is called. Use this before starting any non-trivial task, and whenever the user asks what skills exist, which skill covers something, whether there is a skill for X, or asks you to look for a skill. Also use when you are about to do work that some skill probably codifies — reviewing code, designing UI, debugging, writing tests, planning, making documents or spreadsheets — so you find it before reinventing it rather than after.
---

# Finding skills

Adapted from [obra/superpowers-skills](https://github.com/obra/superpowers-skills),
`skills/using-skills/find-skills`.

Skills are only useful if you find them at the moment they apply. The failure
mode is not refusing to use a skill — it's never realising one existed, doing
the work by hand, and only discovering afterwards that something already
codified it.

That failure has a specific cause worth naming: **skill names are unreliable.**
`ponytail` is about writing the least code possible. `impeccable` is frontend
design. `learn` is for explaining concepts, not for looking things up. Scanning
a list of names and deciding nothing matches is exactly how you miss the one
that did. The search has to run against the descriptions.

## The tool

```bash
.claude/skills/find-skills/find-skills                    # every skill, with its trigger
.claude/skills/find-skills/find-skills --desc 'test|verif'  # match the trigger line only
.claude/skills/find-skills/find-skills 'RED.*GREEN'         # match anywhere in the file
```

**Reach for `--desc` first.** Without it the pattern is matched against the
whole of every `SKILL.md`, and a broad word like `plan` or `interface` appears
somewhere in almost all of them — a query that returns 63 of 67 skills has told
you nothing. `--desc` matches only the frontmatter trigger, which is the line
the author wrote to answer exactly the question you are asking. Drop the flag
when you want the full-text net: hunting a specific technique, tool name, or
phrase that lives in the body rather than the summary.

It walks the project, personal, and bundled skill roots, prints each
`SKILL.md` path with the frontmatter line that says when to use it, and matches
your pattern against skill *content* as well as paths. Output paths are
absolute, so they go straight into the Read tool.

Pattern matching is case-insensitive extended regex. Search for the *problem*,
not the skill you imagine exists — `'chart|graph|plot'` rather than `dataviz`,
`'slide|deck|presentation'` rather than `pptx`. You do not know what the author
called it.

## How to use what comes back

Run two or three searches with different vocabulary before concluding nothing
matches. One query returning nothing means your words were wrong at least as
often as it means the skill is absent.

Then **read the SKILL.md in full** for anything that looks relevant. The
description is a triggering hint, not a summary — a skill routinely contains
constraints, scripts, and templates that its one-line description never
mentions. Deciding from the description alone is the same mistake as deciding
from the name, one level up.

Announce the ones you're going to follow and say what for. That lets your
partner correct a bad match before you've built on it.

## Beyond the filesystem

The script only sees skills on disk, and a good number are not there.

**Read the harness's own available-skills listing too.** Skills served by the
control plane — `dataviz`, `artifact-diagramming`, `artifact-design`,
`claude-api` and others — are invocable by name through the Skill tool but have
no `SKILL.md` anywhere on the machine, so this script cannot find them however
you word the query. They appear only in the `<system-reminder>` listing of
available skills. Scan that list by hand as a second pass; it is short, and the
one you want may well be in it.

When the tools are available, these reach further still:

- `ListSkills` / `SearchSkills` — the user's claude.ai skill library
- `SuggestSkills` — skills they could add but haven't
- `SearchPlugins` — the org plugin catalog

Worth a look when the on-disk search comes up empty and the task seems like
something that ought to be covered.

## Reporting

Say plainly which skills apply and which you checked and rejected. "Nothing
matched" is a real and useful answer — the point is that you looked before
starting, not that you always find something. When you do report matches,
give each one a clause on what it would actually change about the work, so
the choice to use it or skip it is an informed one.
