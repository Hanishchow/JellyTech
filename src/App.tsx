import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/ui/navbar'
import { JellyHero } from '@/components/ui/jelly-hero'
import { TetrisLoader } from '@/components/ui/tetris-loader'
import { LoginPage } from '@/pages/login'
import { SignupPage } from '@/pages/signup'
import { DashboardPage } from '@/pages/dashboard'
import { AboutPage } from '@/pages/about'
import { EventsPage } from '@/pages/events-upcoming'
import { PastEventsPage } from '@/pages/events-past'
import { SpeakersPage } from '@/pages/events-speakers'
import { VisitsPage } from '@/pages/events-visits'
import { PapersPage } from '@/pages/research-papers'
import { ResearchUpdatesPage } from '@/pages/research-updates'
import { PublicationsPage } from '@/pages/research-publications'
import { CollaborationsPage } from '@/pages/research-collaborations'
import { PodcastsPage } from '@/pages/podcasts'
import { TeamPage } from '@/pages/team'
import { BlogPage } from '@/pages/blog'
import { ContactPage } from '@/pages/contact'
import { TermsPage } from '@/pages/terms'
import { PrivacyPage } from '@/pages/privacy'
import { ForgotPasswordPage } from '@/pages/forgot-password'
import { RegisterPage } from '@/pages/register'
import { GrantsPage } from '@/pages/grants'
import { NotFoundPage } from '@/pages/not-found'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TetrisLoader />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<JellyHero />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events/upcoming" element={<EventsPage />} />
          <Route path="/events/past" element={<PastEventsPage />} />
          <Route path="/events/speakers" element={<SpeakersPage />} />
          <Route path="/events/visits" element={<VisitsPage />} />
          <Route path="/research/papers" element={<PapersPage />} />
          <Route path="/research/updates" element={<ResearchUpdatesPage />} />
          <Route path="/research/publications" element={<PublicationsPage />} />
          <Route path="/research/collaborations" element={<CollaborationsPage />} />
          <Route path="/podcasts" element={<PodcastsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/grants" element={<GrantsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}