import { useEffect, useState, lazy, Suspense, useTransition } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useLocationStore } from './store/locationStore'
import { useCartStore } from './store/cartStore'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Categories = lazy(() => import('./pages/Categories'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Orders = lazy(() => import('./pages/Orders'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Policies = lazy(() => import('./pages/Policies'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Restaurants = lazy(() => import('./pages/Restaurants'))
const RestaurantMenu = lazy(() => import('./pages/RestaurantMenu'))
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'))
const Payment = lazy(() => import('./pages/Payment'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const ServiceUnavailable = lazy(() => import('./components/ServiceUnavailable'))
const SelectLocation = lazy(() => import('./pages/SelectLocation'))
const DeliveryDashboard = lazy(() => import('../delivery/AutoAssignmentDashboard.jsx'))
import Toast from './components/Toast'
import InstallBanner from './components/InstallBanner'
import ChatBubble from './components/ChatBubble'
import LocationPermission from './components/LocationPermission'
import { initInstallPrompt, setBadgeCount } from './utils/nativeFeatures'
import { initDataPersistence, initCrossTabSync } from './utils/dataPersistence'

function App() {
  const { loading, initialize } = useAuthStore()
  const { isServiceAvailable, initializeLocation } = useLocationStore()
  const { items } = useCartStore()
  const [initError, setInitError] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        await initialize()
        
        // Initialize location detection in background
        setTimeout(() => {
          initializeLocation().catch(err => {
            console.log('Location detection:', err.message)
          })
        }, 1500)
        
        // Initialize PWA install prompt
        initInstallPrompt()
        
        // Initialize data persistence (auto-save)
        const cleanup = initDataPersistence()
        
        // Initialize cross-tab sync
        initCrossTabSync()
        
        console.log('✅ App initialized with auto-save enabled')
        
        return cleanup
      } catch (error) {
        console.error('Initialization error:', error)
        setInitError(error.message)
      }
    }
    init()
  }, [initialize, initializeLocation])

  // Update badge count when cart changes
  useEffect(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    setBadgeCount(totalItems)
  }, [items])

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Required</h2>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              Please set up your Supabase credentials in the <code className="bg-yellow-100 px-1 rounded">.env</code> file
            </p>
          </div>
          <div className="text-left space-y-2 text-sm text-gray-700">
            <p className="font-semibold">Quick Setup:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create a project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
              <li>Copy your project URL and anon key</li>
              <li>Update the <code className="bg-gray-100 px-1 rounded">.env</code> file</li>
              <li>Restart the dev server</li>
            </ol>
          </div>
          <div className="mt-4 text-center">
            <a href="/QUICK_START.md" className="text-blue-600 hover:underline text-sm">
              See QUICK_START.md for detailed instructions →
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="categories" element={<ServiceRoute><Categories /></ServiceRoute>} />
            <Route path="products" element={<ServiceRoute><Products /></ServiceRoute>} />
            <Route path="products/:id" element={<ServiceRoute><ProductDetail /></ServiceRoute>} />
            <Route path="restaurants" element={<ServiceRoute><Restaurants /></ServiceRoute>} />
            <Route path="restaurants/:id" element={<ServiceRoute><RestaurantMenu /></ServiceRoute>} />
            <Route path="cart" element={<ServiceRoute><Cart /></ServiceRoute>} />
            <Route path="checkout" element={<ProtectedRoute><ServiceRoute><Checkout /></ServiceRoute></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="policies" element={<Policies />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/service-unavailable" element={<ServiceUnavailable />} />
          <Route path="/select-location" element={<SelectLocation />} />
          <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
        </Routes>
      </Suspense>
      
      {/* Global Components */}
      <Toast />
      <InstallBanner />
      <ChatBubble />
      <LocationPermission />
    </Router>
  )
}

function ServiceRoute({ children }) {
  const { isServiceAvailable, loading } = useLocationStore()
  
  // While checking location, show the page
  if (loading || isServiceAvailable === null) {
    return children
  }
  
  // If service not available, redirect to unavailable page
  if (isServiceAvailable === false) {
    return <Navigate to="/service-unavailable" replace />
  }
  
  return children
}

function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default App

