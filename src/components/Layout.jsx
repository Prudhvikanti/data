import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import LocationBanner from './LocationBanner'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col mobile-app-container">
      <Navbar />
      <LocationBanner />
      <main className="flex-1 pb-20 mobile-main-content mobile-safe-bottom">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
