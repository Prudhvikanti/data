import { Link } from 'react-router-dom'
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Heart,
  Home,
  ShoppingBag,
  Info,
  FileText
} from 'lucide-react'
import { hapticFeedback } from '../utils/hapticFeedback'

const QUICK_LINKS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Products', path: '/products', icon: ShoppingBag },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Policies', path: '/policies', icon: FileText }
]

const SOCIAL_LINKS = [
  { icon: Facebook, name: 'Facebook', link: 'https://facebook.com' },
  { icon: Twitter, name: 'Twitter', link: 'https://twitter.com' },
  { icon: Instagram, name: 'Instagram', link: 'https://instagram.com' }
]

export default function Footer() {
  const handleClick = () => {
    hapticFeedback('light')
  }

  return (
    <footer className="hidden md:block fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-300 border-t border-gray-800 z-40">
      <div className="container-custom">
        <div className="py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Quick Links */}
            <div className="flex items-center gap-6">
              {QUICK_LINKS.map(({ name, path, icon: Icon }) => (
                <Link
                  key={name}
                  to={path}
                  onClick={handleClick}
                  className="flex items-center gap-2 text-sm hover:text-white transition-colors group"
                >
                  <Icon className="w-4 h-4 text-primary-400 group-hover:text-primary-300" />
                  {name}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} DoIt. Made with{' '}
              <Heart className="w-3 h-3 text-red-500 inline" /> in India
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 mr-2">Follow us:</span>
              {SOCIAL_LINKS.map(({ icon: Icon, name, link }) => (
                <a
                  key={name}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClick}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  title={name}
                >
                  <Icon className="w-4 h-4 hover:text-white transition-colors" />
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="flex items-center gap-4 text-sm">
              <a
                href="tel:+911234567890"
                className="flex items-center gap-1 hover:text-white transition-colors"
                title="Call us"
              >
                <Phone className="w-4 h-4 text-primary-400" />
                <span className="hidden lg:inline">+91 123 456 7890</span>
              </a>
              <a
                href="mailto:support@doit.com"
                className="flex items-center gap-1 hover:text-white transition-colors"
                title="Email us"
              >
                <Mail className="w-4 h-4 text-primary-400" />
                <span className="hidden lg:inline">support@doit.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
