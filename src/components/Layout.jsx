import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import LocationBanner from './LocationBanner'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <LocationBanner />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
