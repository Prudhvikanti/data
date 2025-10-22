// Auto Assignment Dashboard
// Enhanced dashboard with automatic delivery person assignment and time-based features

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
  Search,
  Settings,
  Zap,
  Users,
  Calendar,
  Star,
  TrendingUp,
  Timer,
  Target
} from 'lucide-react'
import { deliveryService } from './deliveryService'
import { deliveryConfig, deliveryHelpers } from './config'
import { toast } from '../src/components/Toast'

export default function AutoAssignmentDashboard() {
  const [orders, setOrders] = useState([])
  const [deliveryPersons, setDeliveryPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    deliveryStatus: '',
    dateFrom: '',
    dateTo: '',
    deliveryPerson: ''
  })
  const [stats, setStats] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [autoAssignmentEnabled, setAutoAssignmentEnabled] = useState(true)
  const [timeSlots, setTimeSlots] = useState({
    collection: [],
    delivery: []
  })
  const [performance, setPerformance] = useState({})

  useEffect(() => {
    loadData()
    loadTimeSlots()
    loadPerformance()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersData, personsData] = await Promise.all([
        deliveryService.getAllOrders(filters),
        deliveryService.deliveryPersons
      ])
      setOrders(ordersData)
      setDeliveryPersons(personsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadTimeSlots = async () => {
    try {
      const [collectionSlots, deliverySlots] = await Promise.all([
        deliveryService.getAvailableCollectionSlots(),
        deliveryService.getAvailableDeliverySlots()
      ])
      setTimeSlots({
        collection: collectionSlots,
        delivery: deliverySlots
      })
    } catch (error) {
      console.error('Error loading time slots:', error)
    }
  }

  const loadPerformance = async () => {
    try {
      const performanceData = {}
      for (const person of deliveryService.deliveryPersons) {
        performanceData[person.id] = await deliveryService.getDeliveryPersonPerformance(person.id)
      }
      setPerformance(performanceData)
    } catch (error) {
      console.error('Error loading performance:', error)
    }
  }

  const handleAutoAssign = async (orderId) => {
    try {
      const assignedPerson = await deliveryService.autoAssignDeliveryPerson(orderId)
      if (assignedPerson) {
        toast.success(`Order assigned to ${assignedPerson.name}`)
        loadData()
      } else {
        toast.error('No available delivery person found')
      }
    } catch (error) {
      console.error('Error auto-assigning:', error)
      toast.error('Failed to auto-assign delivery person')
    }
  }

  const handleAutoAssignTimeSlots = async (orderId) => {
    try {
      const timeSlots = await deliveryService.autoAssignTimeSlots(orderId)
      if (timeSlots) {
        toast.success('Time slots assigned successfully')
        loadData()
      } else {
        toast.error('No available time slots found')
      }
    } catch (error) {
      console.error('Error auto-assigning time slots:', error)
      toast.error('Failed to assign time slots')
    }
  }

  const handleBulkAutoAssign = async () => {
    try {
      const pendingOrders = orders.filter(order => 
        order.status === deliveryConfig.orderStatus.processing && 
        !order.delivery_person_id
      )

      let assignedCount = 0
      for (const order of pendingOrders) {
        const assignedPerson = await deliveryService.autoAssignDeliveryPerson(order.id)
        if (assignedPerson) {
          assignedCount++
        }
      }

      toast.success(`Auto-assigned ${assignedCount} orders`)
      loadData()
    } catch (error) {
      console.error('Error bulk auto-assigning:', error)
      toast.error('Failed to bulk auto-assign')
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
          <p className="text-gray-600">Loading auto-assignment dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Auto Assignment Dashboard</h1>
              <p className="text-gray-600">Intelligent delivery management with automatic assignment</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Auto Assignment</label>
                <input
                  type="checkbox"
                  checked={autoAssignmentEnabled}
                  onChange={(e) => setAutoAssignmentEnabled(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
              <button
                onClick={handleBulkAutoAssign}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Zap className="w-4 h-4" />
                Bulk Auto-Assign
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(order => order.status === deliveryConfig.orderStatus.delivered).length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(order => order.status === deliveryConfig.orderStatus.outForDelivery).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Delivery Persons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deliveryPersons.filter(person => person.active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Slots Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Collection Time Slots
            </h3>
            <div className="space-y-2">
              {timeSlots.collection.slice(0, 5).map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{slot.start} - {slot.end}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.remainingCapacity} available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Delivery Time Slots
            </h3>
            <div className="space-y-2">
              {timeSlots.delivery.slice(0, 5).map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{slot.start} - {slot.end}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.remainingCapacity} available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery Persons Performance */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Delivery Persons Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryPersons.map((person) => {
                const perf = performance[person.id] || {}
                return (
                  <div key={person.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{person.name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{person.rating}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Total Orders:</span>
                        <span className="font-medium">{perf.totalOrders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Rate:</span>
                        <span className="font-medium">{perf.deliveryRate?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Time:</span>
                        <span className="font-medium">{perf.avgDeliveryTime?.toFixed(0) || 0}min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Load:</span>
                        <span className="font-medium">{perf.currentLoad || 0}/{person.maxOrders}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${((perf.currentLoad || 0) / person.maxOrders) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Orders List with Auto-Assignment */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Orders with Auto-Assignment</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <button
                  onClick={loadData}
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
                  value={filters.deliveryPerson}
                  onChange={(e) => setFilters({ ...filters, deliveryPerson: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Delivery Persons</option>
                  {deliveryPersons.map(person => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
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
                      Delivery Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Slots
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auto Actions
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
                        <div>
                          <div className="text-sm text-gray-900">{order.delivery_person_name || 'Not assigned'}</div>
                          <div className="text-sm text-gray-500">{order.delivery_person_phone || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.collection_time_slot && (
                            <div>Collection: {order.collection_time_slot}</div>
                          )}
                          {order.delivery_time_slot && (
                            <div>Delivery: {order.delivery_time_slot}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {!order.delivery_person_id && (
                            <button
                              onClick={() => handleAutoAssign(order.id)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Zap className="w-4 h-4" />
                              Auto Assign
                            </button>
                          )}
                          {!order.collection_time_slot && (
                            <button
                              onClick={() => handleAutoAssignTimeSlots(order.id)}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            >
                              <Timer className="w-4 h-4" />
                              Assign Time
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
    </div>
  )
}
