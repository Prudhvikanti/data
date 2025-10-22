// Delivery Management Dashboard
// Component for managing delivery operations

import React, { useState, useEffect } from 'react'
import { 
  Truck, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Phone, 
  User,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react'
import { deliveryService } from './deliveryService'
import { deliveryConfig, deliveryHelpers } from './config'
import { toast } from '../src/components/Toast'

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    deliveryStatus: '',
    dateFrom: '',
    dateTo: ''
  })
  const [stats, setStats] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await deliveryService.getAllOrders(filters)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await deliveryService.getDeliveryStats(filters.dateFrom, filters.dateTo)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus, deliveryInfo = {}) => {
    try {
      await deliveryService.updateOrderStatus(orderId, newStatus, deliveryInfo)
      
      // Send notification to customer
      await deliveryService.sendCustomerNotification(
        orderId, 
        'order', 
        `Your order status has been updated to ${deliveryHelpers.getOrderStatusText(newStatus)}`
      )
      
      toast.success('Order status updated successfully')
      loadOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const handleDeliveryStatusUpdate = async (orderId, deliveryStatus, message = '') => {
    try {
      await deliveryService.updateDeliveryStatus(orderId, deliveryStatus, message)
      toast.success('Delivery status updated successfully')
      loadOrders()
    } catch (error) {
      console.error('Error updating delivery status:', error)
      toast.error('Failed to update delivery status')
    }
  }

  const handleAssignDelivery = async (orderId) => {
    const deliveryPersonInfo = {
      id: 'delivery-001',
      name: deliveryConfig.deliveryGuy.name,
      phone: deliveryConfig.deliveryGuy.phone
    }

    try {
      await deliveryService.assignDeliveryPerson(orderId, deliveryPersonInfo)
      toast.success('Delivery person assigned successfully')
      loadOrders()
    } catch (error) {
      console.error('Error assigning delivery person:', error)
      toast.error('Failed to assign delivery person')
    }
  }

  const getStatusColor = (status) => {
    const colorMap = {
      [deliveryConfig.orderStatus.pending]: 'bg-yellow-100 text-yellow-800',
      [deliveryConfig.orderStatus.confirmed]: 'bg-blue-100 text-blue-800',
      [deliveryConfig.orderStatus.processing]: 'bg-orange-100 text-orange-800',
      [deliveryConfig.orderStatus.outForDelivery]: 'bg-purple-100 text-purple-800',
      [deliveryConfig.orderStatus.delivered]: 'bg-green-100 text-green-800',
      [deliveryConfig.orderStatus.cancelled]: 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getDeliveryStatusColor = (status) => {
    const colorMap = {
      [deliveryConfig.deliveryStatus.pending]: 'bg-yellow-100 text-yellow-800',
      [deliveryConfig.deliveryStatus.assigned]: 'bg-blue-100 text-blue-800',
      [deliveryConfig.deliveryStatus.pickedUp]: 'bg-orange-100 text-orange-800',
      [deliveryConfig.deliveryStatus.inTransit]: 'bg-purple-100 text-purple-800',
      [deliveryConfig.deliveryStatus.delivered]: 'bg-green-100 text-green-800',
      [deliveryConfig.deliveryStatus.failed]: 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading delivery dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Management</h1>
          <p className="text-gray-600">Manage orders and delivery operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out for Delivery</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outForDeliveryOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <button
                  onClick={loadOrders}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value={deliveryConfig.orderStatus.pending}>Pending</option>
                  <option value={deliveryConfig.orderStatus.confirmed}>Confirmed</option>
                  <option value={deliveryConfig.orderStatus.processing}>Processing</option>
                  <option value={deliveryConfig.orderStatus.outForDelivery}>Out for Delivery</option>
                  <option value={deliveryConfig.orderStatus.delivered}>Delivered</option>
                  <option value={deliveryConfig.orderStatus.cancelled}>Cancelled</option>
                </select>

                <select
                  value={filters.deliveryStatus}
                  onChange={(e) => setFilters({ ...filters, deliveryStatus: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Delivery Statuses</option>
                  <option value={deliveryConfig.deliveryStatus.pending}>Pending</option>
                  <option value={deliveryConfig.deliveryStatus.assigned}>Assigned</option>
                  <option value={deliveryConfig.deliveryStatus.pickedUp}>Picked Up</option>
                  <option value={deliveryConfig.deliveryStatus.inTransit}>In Transit</option>
                  <option value={deliveryConfig.deliveryStatus.delivered}>Delivered</option>
                  <option value={deliveryConfig.deliveryStatus.failed}>Failed</option>
                </select>

                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="From Date"
                />

                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="To Date"
                />
              </div>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number || order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${order.total_amount}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{order.phone}</div>
                        <div className="text-sm text-gray-500">{order.delivery_address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {deliveryHelpers.getOrderStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDeliveryStatusColor(order.delivery_status)}`}>
                        {deliveryHelpers.getDeliveryStatusText(order.delivery_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{order.delivery_person_name || 'Not assigned'}</div>
                        <div className="text-sm text-gray-500">{order.delivery_person_phone || ''}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {order.status === deliveryConfig.orderStatus.pending && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, deliveryConfig.orderStatus.confirmed)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Confirm
                          </button>
                        )}
                        {order.status === deliveryConfig.orderStatus.confirmed && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, deliveryConfig.orderStatus.processing)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Process
                          </button>
                        )}
                        {order.status === deliveryConfig.orderStatus.processing && (
                          <button
                            onClick={() => handleAssignDelivery(order.id)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Assign Delivery
                          </button>
                        )}
                        {order.delivery_status === deliveryConfig.deliveryStatus.assigned && (
                          <button
                            onClick={() => handleDeliveryStatusUpdate(order.id, deliveryConfig.deliveryStatus.pickedUp)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Picked Up
                          </button>
                        )}
                        {order.delivery_status === deliveryConfig.deliveryStatus.pickedUp && (
                          <button
                            onClick={() => handleDeliveryStatusUpdate(order.id, deliveryConfig.deliveryStatus.inTransit)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Mark In Transit
                          </button>
                        )}
                        {order.delivery_status === deliveryConfig.deliveryStatus.inTransit && (
                          <button
                            onClick={() => handleDeliveryStatusUpdate(order.id, deliveryConfig.deliveryStatus.delivered)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
