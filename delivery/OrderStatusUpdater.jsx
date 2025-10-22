// Order Status Updater Component
// Allows updating order status and delivery information

import React, { useState } from 'react'
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  User, 
  Phone, 
  MapPin,
  Save,
  X
} from 'lucide-react'
import { deliveryService } from './deliveryService'
import { deliveryConfig, deliveryHelpers } from './config'
import { toast } from '../src/components/Toast'

export default function OrderStatusUpdater({ order, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: order.status || deliveryConfig.orderStatus.pending,
    deliveryStatus: order.delivery_status || deliveryConfig.deliveryStatus.pending,
    deliveryGuyName: order.delivery_person_name || deliveryConfig.deliveryGuy.name,
    deliveryGuyPhone: order.delivery_person_phone || deliveryConfig.deliveryGuy.phone,
    deliveryGuyId: order.delivery_person_id || 'delivery-001',
    deliveryVehicle: order.delivery_vehicle || '',
    deliveryVehicleNumber: order.delivery_vehicle_number || '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const deliveryInfo = {
        deliveryGuyName: formData.deliveryGuyName,
        deliveryGuyPhone: formData.deliveryGuyPhone,
        deliveryGuyId: formData.deliveryGuyId,
        deliveryVehicle: formData.deliveryVehicle,
        deliveryVehicleNumber: formData.deliveryVehicleNumber,
        deliveryStatus: formData.deliveryStatus,
        message: formData.message
      }

      await deliveryService.updateOrderStatus(order.id, formData.status, deliveryInfo)
      
      // Send notification to customer
      await deliveryService.sendCustomerNotification(
        order.id, 
        'order', 
        `Your order status has been updated to ${deliveryHelpers.getOrderStatusText(formData.status)}`
      )

      toast.success('Order status updated successfully')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusOptions = () => {
    const currentStatus = order.status
    const validTransitions = {
      [deliveryConfig.orderStatus.pending]: [
        { value: deliveryConfig.orderStatus.confirmed, label: 'Confirmed' },
        { value: deliveryConfig.orderStatus.cancelled, label: 'Cancelled' }
      ],
      [deliveryConfig.orderStatus.confirmed]: [
        { value: deliveryConfig.orderStatus.processing, label: 'Processing' },
        { value: deliveryConfig.orderStatus.cancelled, label: 'Cancelled' }
      ],
      [deliveryConfig.orderStatus.processing]: [
        { value: deliveryConfig.orderStatus.outForDelivery, label: 'Out for Delivery' },
        { value: deliveryConfig.orderStatus.cancelled, label: 'Cancelled' }
      ],
      [deliveryConfig.orderStatus.outForDelivery]: [
        { value: deliveryConfig.orderStatus.delivered, label: 'Delivered' },
        { value: deliveryConfig.orderStatus.cancelled, label: 'Cancelled' }
      ],
      [deliveryConfig.orderStatus.delivered]: [],
      [deliveryConfig.orderStatus.cancelled]: []
    }
    return validTransitions[currentStatus] || []
  }

  const getDeliveryStatusOptions = () => {
    return [
      { value: deliveryConfig.deliveryStatus.pending, label: 'Pending' },
      { value: deliveryConfig.deliveryStatus.assigned, label: 'Assigned' },
      { value: deliveryConfig.deliveryStatus.pickedUp, label: 'Picked Up' },
      { value: deliveryConfig.deliveryStatus.inTransit, label: 'In Transit' },
      { value: deliveryConfig.deliveryStatus.delivered, label: 'Delivered' },
      { value: deliveryConfig.deliveryStatus.failed, label: 'Failed' }
    ]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Update Order Status
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Order ID:</span>
                <span className="ml-2 font-medium">{order.order_number || order.id.slice(0, 8)}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <span className="ml-2 font-medium">${order.total_amount}</span>
              </div>
              <div>
                <span className="text-gray-600">Customer Phone:</span>
                <span className="ml-2 font-medium">{order.phone}</span>
              </div>
              <div>
                <span className="text-gray-600">Delivery Address:</span>
                <span className="ml-2 font-medium">{order.delivery_address}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Status
              </label>
              <select
                name="deliveryStatus"
                value={formData.deliveryStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {getDeliveryStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Person Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Delivery Person Name
                </label>
                <input
                  type="text"
                  name="deliveryGuyName"
                  value={formData.deliveryGuyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter delivery person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Delivery Person Phone
                </label>
                <input
                  type="tel"
                  name="deliveryGuyPhone"
                  value={formData.deliveryGuyPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Delivery Vehicle Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="w-4 h-4 inline mr-1" />
                  Delivery Vehicle
                </label>
                <input
                  type="text"
                  name="deliveryVehicle"
                  value={formData.deliveryVehicle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Bike, Car, Van"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="deliveryVehicleNumber"
                  value={formData.deliveryVehicleNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter vehicle number"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter update message for customer..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
