import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/ui/navbar'
import { JellyHero } from '@/components/ui/jelly-hero'
import { LoginPage } from '@/pages/login'
import { SignupPage } from '@/pages/signup'
import { DashboardPage } from '@/pages/dashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<JellyHero />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  )
}