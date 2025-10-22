import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { hapticFeedback } from '../utils/hapticFeedback'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to your error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  handleRefresh = () => {
    hapticFeedback('medium')
    window.location.reload()
  }

  handleGoHome = () => {
    hapticFeedback('light')
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>

            {/* Error Content */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-8">
              We're sorry for the inconvenience. Please try refreshing the page or go back to the homepage.
            </p>

            {/* Error Details (for development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 text-left bg-gray-100 p-4 rounded-xl overflow-auto max-h-48">
                <p className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={this.handleRefresh}
                className="inline-flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-700 active:scale-[0.98] transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>

              <Link
                to="/"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 active:scale-[0.98] transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary