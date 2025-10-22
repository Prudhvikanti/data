import { useState } from 'react'
import { Shield, Truck, RotateCcw, Lock, FileText, ChevronDown, ChevronUp } from 'lucide-react'

export default function Policies() {
  const [expandedSection, setExpandedSection] = useState('delivery')

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const policies = [
    {
      id: 'delivery',
      title: 'Delivery Policy',
      icon: Truck,
      color: 'primary',
      content: {
        intro: 'We are committed to delivering your orders quickly and safely to your doorstep.',
        sections: [
          {
            title: 'Delivery Time',
            points: [
              'Standard delivery within 10-15 minutes in service areas',
              'Orders are processed immediately upon confirmation',
              'Real-time order tracking available',
              'Delivery timing: 6:00 AM to 11:00 PM daily'
            ]
          },
          {
            title: 'Delivery Areas',
            points: [
              'Samalkota (533434) - 15km radius',
              'Kakinada (533001) - 20km radius',
              'Rajahmundry (533101) - 20km radius',
              'Check service availability using our location detector'
            ]
          },
          {
            title: 'Delivery Charges',
            points: [
              'FREE delivery on orders above ₹20',
              '₹2.99 delivery fee on orders below ₹20',
              'No hidden charges',
              'Transparent pricing displayed at checkout'
            ]
          },
          {
            title: 'Delivery Instructions',
            points: [
              'Provide accurate delivery address with landmarks',
              'Keep phone reachable for delivery updates',
              'Ensure someone is available to receive the order',
              'Check products upon delivery for quality assurance'
            ]
          }
        ]
      }
    },
    {
      id: 'return',
      title: 'Return & Refund Policy',
      icon: RotateCcw,
      color: 'green',
      content: {
        intro: 'Your satisfaction is our priority. We offer hassle-free returns and refunds.',
        sections: [
          {
            title: 'Return Eligibility',
            points: [
              'Products can be returned within 24 hours of delivery',
              'Items must be unused and in original packaging',
              'Perishable items: Report quality issues immediately upon delivery',
              'Non-perishable items: Return within 7 days'
            ]
          },
          {
            title: 'Return Process',
            points: [
              'Contact customer support via phone or email',
              'Provide order ID and reason for return',
              'Our team will schedule pickup within 24 hours',
              'Refund processed after quality check'
            ]
          },
          {
            title: 'Refund Policy',
            points: [
              'Full refund for damaged or incorrect items',
              'Refund processed within 3-5 business days',
              'Amount credited to original payment method',
              'For COD orders, refund via bank transfer or wallet'
            ]
          },
          {
            title: 'Non-Returnable Items',
            points: [
              'Products with broken seals or used items',
              'Items marked as non-returnable at checkout',
              'Products damaged due to misuse',
              'Special offers or clearance items (as specified)'
            ]
          }
        ]
      }
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Lock,
      color: 'blue',
      content: {
        intro: 'We respect your privacy and are committed to protecting your personal information.',
        sections: [
          {
            title: 'Information We Collect',
            points: [
              'Name, email, and phone number for account creation',
              'Delivery address for order fulfillment',
              'Location data (with your permission) for service availability',
              'Payment information (processed securely by payment gateway)',
              'Order history and preferences for better service'
            ]
          },
          {
            title: 'How We Use Your Information',
            points: [
              'Process and deliver your orders',
              'Send order updates and delivery notifications',
              'Improve our services and user experience',
              'Personalized product recommendations',
              'Communicate promotional offers (with your consent)'
            ]
          },
          {
            title: 'Data Security',
            points: [
              'All data encrypted using industry-standard SSL',
              'Secure payment gateway (PCI DSS compliant)',
              'No credit card information stored on our servers',
              'Regular security audits and updates',
              'Access restricted to authorized personnel only'
            ]
          },
          {
            title: 'Your Rights',
            points: [
              'Access your personal data anytime',
              'Request data deletion from our systems',
              'Opt-out of promotional communications',
              'Update or correct your information',
              'Data portability upon request'
            ]
          }
        ]
      }
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: FileText,
      color: 'purple',
      content: {
        intro: 'By using QuickCommerce, you agree to these terms and conditions.',
        sections: [
          {
            title: 'User Account',
            points: [
              'You must be 18+ years to create an account',
              'Provide accurate and complete information',
              'Keep your password secure and confidential',
              'You are responsible for all activities under your account',
              'We reserve the right to suspend accounts for policy violations'
            ]
          },
          {
            title: 'Product Information',
            points: [
              'We strive to provide accurate product information',
              'Prices and availability subject to change',
              'Product images are for reference only',
              'Actual products may vary slightly from images',
              'Weight/quantity may have minor variations (±5%)'
            ]
          },
          {
            title: 'Order Cancellation',
            points: [
              'Cancel orders within 2 minutes of placement',
              'After dispatch, cancellation not possible',
              'Contact support immediately for urgent cancellations',
              'Refund for cancelled orders processed within 3-5 days'
            ]
          },
          {
            title: 'Payment Terms',
            points: [
              'Multiple payment options available',
              'Prices include all applicable taxes',
              'Payment confirmation required before dispatch',
              'Failed payments may result in order cancellation',
              'We do not store your payment card information'
            ]
          },
          {
            title: 'Limitation of Liability',
            points: [
              'We are not liable for delays beyond our control',
              'Maximum liability limited to order value',
              'Not responsible for misuse of products',
              'Quality issues must be reported within 24 hours',
              'Service availability subject to location'
            ]
          }
        ]
      }
    }
  ]

  const getIconColor = (color) => {
    const colors = {
      primary: 'text-primary-600 bg-primary-100',
      green: 'text-green-600 bg-green-100',
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100'
    }
    return colors[color] || colors.primary
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Our Policies
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn about our delivery, return, privacy policies and terms of service
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-4">
          {policies.map((policy) => {
            const Icon = policy.icon
            const isExpanded = expandedSection === policy.id

            return (
              <div
                key={policy.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all"
              >
                {/* Header */}
                <button
                  onClick={() => toggleSection(policy.id)}
                  className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getIconColor(policy.color)} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">
                        {policy.title}
                      </h2>
                    </div>
                  </div>
                  <div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Content */}
                {isExpanded && (
                  <div className="px-4 md:px-6 pb-6 pt-2 border-t border-gray-100 animate-fade-in">
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {policy.content.intro}
                    </p>

                    <div className="space-y-6">
                      {policy.content.sections.map((section, index) => (
                        <div key={index}>
                          <h3 className="font-semibold text-gray-900 mb-3 text-base md:text-lg">
                            {section.title}
                          </h3>
                          <ul className="space-y-2">
                            {section.points.map((point, pIndex) => (
                              <li key={pIndex} className="flex items-start gap-2 text-sm md:text-base text-gray-700">
                                <span className="text-primary-600 mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 md:p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Have Questions?
          </h3>
          <p className="text-gray-700 mb-6">
            Our customer support team is here to help you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@quickcommerce.com"
              className="btn-primary"
            >
              📧 Email Support
            </a>
            <a
              href="tel:+919876543210"
              className="btn-secondary"
            >
              📞 Call Us
            </a>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Last updated: October 18, 2025
        </p>
      </div>
    </div>
  )
}

