import { Home, ShoppingBag, ShoppingCart, User, LayoutGrid } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

export default function BottomNav() {
  const location = useLocation()
  const itemCount = useCartStore(state => state.getItemCount())
  const { user } = useAuthStore()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const navItems = [
    { path: '/', icon: Home, label: 'Home', exact: true },
    { path: '/categories', icon: LayoutGrid, label: 'Categories' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
    { path: user ? '/profile' : '/login', icon: User, label: user ? 'Profile' : 'Login' },
  ]

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        zIndex: '9999',
        height: '60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const active = item.exact ? location.pathname === item.path : isActive(item.path)
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center transition-all ${
              active
                ? 'text-primary-600 scale-105'
                : 'text-gray-600 hover:text-primary-600'
            }`}
            style={{
              height: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <div className="relative">
              <Icon className={`transition-all ${active ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
              {active && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </div>
            <span className={`text-xs mt-1 transition-all ${active ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
