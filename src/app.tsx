import { useRoute, navigate } from './lib/router';
import { initTheme } from './lib/theme';
import { findChapter } from './content';
import { TopBar } from './components/topbar';
import { Footer } from './components/footer';
import { HomeView } from './views/home';
import { ChapterView } from './views/chapter';
import { LessonView } from './views/lesson';
import { PracticeView } from './views/practice';

initTheme();

function NotFound({ label }: { label: string }) {
  return (
    <div class="ga-view">
      <p class="ga-section-kicker ga-mono">Not found</p>
      <h2>{label}</h2>
      <div class="ga-section-nav" style={{ position: 'static' }}>
        <button type="button" class="ga-btn ga-btn-primary" onClick={() => navigate('#/')}>
          ← Back to course home
        </button>
      </div>
    </div>
  );
}

/** Standard single-column layout used by every view except the lesson,
    which owns its stepper + rail chrome. */
function Centered({ children }: { children: preact.ComponentChildren }) {
  return (
    <div class="ga-shell ga-centered">
      <main>{children}</main>
    </div>
  );
}

export function App() {
  const route = useRoute();

  let body;
  if (route.view === 'home') {
    body = <Centered><HomeView /></Centered>;
  } else {
    const chapter = findChapter(route.chapterId);
    if (!chapter) {
      body = <Centered><NotFound label="That chapter does not exist (yet)." /></Centered>;
    } else if (route.view === 'chapter') {
      body = <Centered><ChapterView chapter={chapter} /></Centered>;
    } else if (route.view === 'lesson') {
      // LessonView renders its own chrome: mobile stepper + desktop rail + main.
      body = <LessonView chapter={chapter} section={route.section} />;
    } else {
      const set = chapter.practiceSets.find((s) => s.id === route.setId);
      body = set ? (
        <Centered>
          <PracticeView chapter={chapter} setId={route.setId} problem={route.problem} />
        </Centered>
      ) : (
        <Centered><NotFound label="That practice set does not exist." /></Centered>
      );
    }
  }

  return (
    <>
      <TopBar />
      {body}
      <Footer />
    </>
  );
}
