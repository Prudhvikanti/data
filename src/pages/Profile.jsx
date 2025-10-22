import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { User, Mail, LogOut, Package } from 'lucide-react'

export default function Profile() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container-custom max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="space-y-4">
          {/* User Info Card */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {user?.user_metadata?.full_name || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">My Orders</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-600">Sign Out</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium text-gray-900">
                  {new Date(user?.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

