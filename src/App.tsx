import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { TetrisLoader } from '@/components/ui/tetris-loader'
import { HomePage } from '@/pages/home'
import { AboutPage } from '@/pages/about'
import { ProgramsPage } from '@/pages/programs'
import { MediaPage } from '@/pages/media'
import { TeamPage } from '@/pages/team'
import { JoinPage } from '@/pages/join'
import { LoginPage } from '@/pages/login'
import { DashboardPage } from '@/pages/dashboard'
import { PrivacyPage, TermsPage, NotFoundPage } from '@/pages/legal'

/* The panel and the lab benches are split out of the main bundle. Three.js
   alone is ~500KB, and it is imported by a route the public never opens;
   leaving it in the entry chunk made every visitor download a 3D engine to
   read the About page. */
const AdminPage = lazy(() =>
  import('@/pages/admin').then((m) => ({ default: m.AdminPage }))
)
const LabMedusaPage = lazy(() =>
  import('@/pages/lab-medusa').then((m) => ({ default: m.LabMedusaPage }))
)
const LabOriginalPage = lazy(() =>
  import('@/pages/lab-original').then((m) => ({ default: m.LabOriginalPage }))
)
const LabFramingPage = lazy(() =>
  import('@/pages/lab-framing').then((m) => ({ default: m.LabFramingPage }))
)

/* The site used to be twenty-two routes across two dropdown menus, most of
   them a page-length description of something that had not happened yet. Those
   URLs are in people's history and in the club's own posts, so each one
   forwards to the section that absorbed it rather than dropping into a 404. */
const REDIRECTS: Record<string, string> = {
  '/events/upcoming': '/programs',
  '/events/past': '/programs',
  '/events/speakers': '/programs',
  '/events/visits': '/programs',
  '/research/papers': '/media',
  '/research/updates': '/media',
  '/research/publications': '/media',
  '/research/collaborations': '/programs',
  '/podcasts': '/media',
  '/blog': '/media',
  '/grants': '/team',
  '/contact': '/join',
  '/signup': '/join',
  '/register': '/join',
  '/forgot-password': '/login',
}

/* The loading screen is markup in index.html, so something has to take it away.
   On the public site that is TetrisLoader, which plays the board out first; the
   panel skips the ceremony and removes it on sight. Without this the admin
   route sits behind a tetris game forever. */
function DismissLoader() {
  useEffect(() => {
    document.getElementById('tl-screen')?.remove()
  }, [])
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()

  /* The admin panel deliberately sits outside the site's chrome: no navbar, no
     footer, no loading screen, no jellyfish. It is a different room. */
  if (pathname.startsWith('/admin') || pathname.startsWith('/lab')) {
    return (
      <>
        <DismissLoader />
        <Suspense fallback={<div className="min-h-[100dvh] bg-ground" />}>
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/lab/medusa" element={<LabMedusaPage />} />
            <Route path="/lab/original" element={<LabOriginalPage />} />
            <Route path="/lab/framing" element={<LabFramingPage />} />
          </Routes>
        </Suspense>
      </>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-ground text-ink">
      <TetrisLoader />
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          {Object.entries(REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
