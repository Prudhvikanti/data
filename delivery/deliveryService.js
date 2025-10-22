// Delivery Management Service
// Handles all delivery-related operations with auto-assignment and time-based features

import { supabase } from '../src/lib/supabase'
import { deliveryConfig, deliveryHelpers } from './config'
import { toast } from '../src/components/Toast'

export class DeliveryService {
  constructor() {
    this.config = deliveryConfig
    this.helpers = deliveryHelpers
    this.deliveryPersons = this.loadDeliveryPersons()
    this.collectionTimeSlots = this.loadCollectionTimeSlots()
    this.deliveryTimeSlots = this.loadDeliveryTimeSlots()
  }

  // Load delivery persons from environment
  loadDeliveryPersons() {
    try {
      const persons = import.meta.env.VITE_DELIVERY_PERSONS
      return persons ? JSON.parse(persons) : [{
        id: 'delivery-001',
        name: deliveryConfig.deliveryGuy.name,
        phone: deliveryConfig.deliveryGuy.phone,
        email: deliveryConfig.deliveryGuy.email,
        vehicle: 'Bike',
        vehicleNumber: 'BIKE-001',
        maxOrders: 5,
        workingHours: '09:00-18:00',
        zones: ['downtown'],
        rating: 4.5,
        active: true
      }]
    } catch (error) {
      console.error('Error loading delivery persons:', error)
      return []
    }
  }

  // Load collection time slots
  loadCollectionTimeSlots() {
    try {
      const slots = import.meta.env.VITE_COLLECTION_TIME_SLOTS
      return slots ? JSON.parse(slots) : []
    } catch (error) {
      console.error('Error loading collection time slots:', error)
      return []
    }
  }

  // Load delivery time slots
  loadDeliveryTimeSlots() {
    try {
      const slots = import.meta.env.VITE_DELIVERY_TIME_SLOTS
      return slots ? JSON.parse(slots) : []
    } catch (error) {
      console.error('Error loading delivery time slots:', error)
      return []
    }
  }

  // Update order status and delivery information
  async updateOrderStatus(orderId, status, deliveryInfo = {}) {
    try {
      const updateData = {
        status: status,
        updated_at: new Date().toISOString()
      }

      // Add delivery information if provided
      if (deliveryInfo.deliveryGuyName) {
        updateData.delivery_person_name = deliveryInfo.deliveryGuyName
      }
      if (deliveryInfo.deliveryGuyPhone) {
        updateData.delivery_person_phone = deliveryInfo.deliveryGuyPhone
      }
      if (deliveryInfo.deliveryGuyId) {
        updateData.delivery_person_id = deliveryInfo.deliveryGuyId
      }
      if (deliveryInfo.deliveryVehicle) {
        updateData.delivery_vehicle = deliveryInfo.deliveryVehicle
      }
      if (deliveryInfo.deliveryVehicleNumber) {
        updateData.delivery_vehicle_number = deliveryInfo.deliveryVehicleNumber
      }
      if (deliveryInfo.deliveryStatus) {
        updateData.delivery_status = deliveryInfo.deliveryStatus
      }
      if (deliveryInfo.estimatedDeliveryTime) {
        updateData.estimated_delivery_time = deliveryInfo.estimatedDeliveryTime
      }
      if (deliveryInfo.actualDeliveryTime) {
        updateData.actual_delivery_time = deliveryInfo.actualDeliveryTime
      }

      // Update the order
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      // Create order status history entry
      await this.createOrderStatusHistory(orderId, status, deliveryInfo.message || `Order status updated to ${this.helpers.getOrderStatusText(status)}`)

      // Create order tracking entry
      await this.createOrderTracking(orderId, status, deliveryInfo.message || `Order status updated to ${this.helpers.getOrderStatusText(status)}`)

      return data
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  // Create order status history entry
  async createOrderStatusHistory(orderId, status, message, updatedBy = 'delivery_system') {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: status,
          message: message,
          updated_by: updatedBy,
          updated_by_type: 'system'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating order status history:', error)
      throw error
    }
  }

  // Create order tracking entry
  async createOrderTracking(orderId, status, message, location = null) {
    try {
      const trackingData = {
        order_id: orderId,
        status: status,
        message: message
      }

      if (location) {
        trackingData.location_latitude = location.latitude
        trackingData.location_longitude = location.longitude
        trackingData.location_address = location.address
      }

      const { data, error } = await supabase
        .from('order_tracking')
        .insert(trackingData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating order tracking:', error)
      throw error
    }
  }

  // Get order details
  async getOrderDetails(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_tracking (*),
          order_status_history (*)
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching order details:', error)
      throw error
    }
  }

  // Get all orders for delivery management
  async getAllOrders(filters = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_tracking (*)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.deliveryStatus) {
        query = query.eq('delivery_status', filters.deliveryStatus)
      }
      if (filters.deliveryPersonId) {
        query = query.eq('delivery_person_id', filters.deliveryPersonId)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  // Assign delivery person to order
  async assignDeliveryPerson(orderId, deliveryPersonInfo) {
    try {
      const updateData = {
        delivery_person_id: deliveryPersonInfo.id,
        delivery_person_name: deliveryPersonInfo.name,
        delivery_person_phone: deliveryPersonInfo.phone,
        delivery_status: this.config.deliveryStatus.assigned,
        status: this.config.orderStatus.outForDelivery,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      // Create status history
      await this.createOrderStatusHistory(
        orderId, 
        this.config.orderStatus.outForDelivery, 
        `Order assigned to delivery person: ${deliveryPersonInfo.name}`
      )

      return data
    } catch (error) {
      console.error('Error assigning delivery person:', error)
      throw error
    }
  }

  // Update delivery status
  async updateDeliveryStatus(orderId, deliveryStatus, message = '') {
    try {
      const updateData = {
        delivery_status: deliveryStatus,
        updated_at: new Date().toISOString()
      }

      // Update order status based on delivery status
      if (deliveryStatus === this.config.deliveryStatus.delivered) {
        updateData.status = this.config.orderStatus.delivered
        updateData.actual_delivery_time = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      // Create status history
      await this.createOrderStatusHistory(
        orderId, 
        data.status, 
        message || `Delivery status updated to ${this.helpers.getDeliveryStatusText(deliveryStatus)}`
      )

      return data
    } catch (error) {
      console.error('Error updating delivery status:', error)
      throw error
    }
  }

  // Get delivery statistics
  async getDeliveryStats(dateFrom = null, dateTo = null) {
    try {
      let query = supabase
        .from('orders')
        .select('status, delivery_status, created_at, total_amount')

      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate statistics
      const stats = {
        totalOrders: data.length,
        pendingOrders: data.filter(order => order.status === this.config.orderStatus.pending).length,
        confirmedOrders: data.filter(order => order.status === this.config.orderStatus.confirmed).length,
        processingOrders: data.filter(order => order.status === this.config.orderStatus.processing).length,
        outForDeliveryOrders: data.filter(order => order.status === this.config.orderStatus.outForDelivery).length,
        deliveredOrders: data.filter(order => order.status === this.config.orderStatus.delivered).length,
        cancelledOrders: data.filter(order => order.status === this.config.orderStatus.cancelled).length,
        totalRevenue: data.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      }

      return stats
    } catch (error) {
      console.error('Error fetching delivery stats:', error)
      throw error
    }
  }

  // Send notification to customer
  async sendCustomerNotification(orderId, notificationType, message) {
    try {
      // Get order details
      const order = await this.getOrderDetails(orderId)
      
      if (!order) {
        throw new Error('Order not found')
      }

      // Create notification entry
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: order.user_id,
          type: notificationType,
          title: `Order ${order.order_number || orderId} Update`,
          message: message,
          data: {
            order_id: orderId,
            order_number: order.order_number,
            status: order.status,
            delivery_status: order.delivery_status
          }
        })
        .select()
        .single()

      if (error) throw error

      // Show toast notification
      toast.success(message, `Order ${order.order_number || orderId} Updated`)

      return data
    } catch (error) {
      console.error('Error sending customer notification:', error)
      throw error
    }
  }

  // Auto-assign delivery person based on various factors
  async autoAssignDeliveryPerson(orderId, orderDetails = {}) {
    try {
      if (!import.meta.env.VITE_AUTO_ASSIGNMENT_ENABLED === 'true') {
        return null
      }

      const algorithm = import.meta.env.VITE_ASSIGNMENT_ALGORITHM || 'round_robin'
      let assignedPerson = null

      switch (algorithm) {
        case 'round_robin':
          assignedPerson = await this.assignByRoundRobin(orderId, orderDetails)
          break
        case 'load_balancing':
          assignedPerson = await this.assignByLoadBalancing(orderId, orderDetails)
          break
        case 'proximity':
          assignedPerson = await this.assignByProximity(orderId, orderDetails)
          break
        case 'rating':
          assignedPerson = await this.assignByRating(orderId, orderDetails)
          break
        default:
          assignedPerson = await this.assignByRoundRobin(orderId, orderDetails)
      }

      if (assignedPerson) {
        await this.assignDeliveryPerson(orderId, assignedPerson)
        return assignedPerson
      }

      return null
    } catch (error) {
      console.error('Error in auto-assignment:', error)
      throw error
    }
  }

  // Round-robin assignment
  async assignByRoundRobin(orderId, orderDetails) {
    const activePersons = this.deliveryPersons.filter(person => person.active)
    if (activePersons.length === 0) return null

    // Get current assignments for each person
    const assignments = await this.getCurrentAssignments()
    const personLoads = activePersons.map(person => ({
      ...person,
      currentLoad: assignments[person.id] || 0
    }))

    // Find person with least load
    const selectedPerson = personLoads.reduce((min, person) => 
      person.currentLoad < min.currentLoad ? person : min
    )

    return selectedPerson
  }

  // Load balancing assignment
  async assignByLoadBalancing(orderId, orderDetails) {
    const activePersons = this.deliveryPersons.filter(person => person.active)
    if (activePersons.length === 0) return null

    const assignments = await this.getCurrentAssignments()
    
    // Filter persons who haven't reached max capacity
    const availablePersons = activePersons.filter(person => 
      (assignments[person.id] || 0) < person.maxOrders
    )

    if (availablePersons.length === 0) return null

    // Consider working hours
    const currentHour = new Date().getHours()
    const workingPersons = availablePersons.filter(person => {
      const [startHour] = person.workingHours.split('-').map(h => parseInt(h))
      const [endHour] = person.workingHours.split('-').map(h => parseInt(h.split(':')[0]))
      return currentHour >= startHour && currentHour < endHour
    })

    if (workingPersons.length === 0) return null

    // Select person with lowest load
    const selectedPerson = workingPersons.reduce((min, person) => 
      (assignments[person.id] || 0) < (assignments[min.id] || 0) ? person : min
    )

    return selectedPerson
  }

  // Proximity-based assignment
  async assignByProximity(orderId, orderDetails) {
    const activePersons = this.deliveryPersons.filter(person => person.active)
    if (activePersons.length === 0) return null

    // Get order location
    const orderLocation = {
      latitude: orderDetails.delivery_latitude,
      longitude: orderDetails.delivery_longitude
    }

    if (!orderLocation.latitude || !orderLocation.longitude) {
      return this.assignByRoundRobin(orderId, orderDetails)
    }

    // Calculate distances and select closest person
    const personsWithDistance = activePersons.map(person => {
      const distance = this.calculateDistance(
        orderLocation.latitude,
        orderLocation.longitude,
        person.currentLatitude || 0,
        person.currentLongitude || 0
      )
      return { ...person, distance }
    })

    // Sort by distance and select closest
    personsWithDistance.sort((a, b) => a.distance - b.distance)
    return personsWithDistance[0]
  }

  // Rating-based assignment
  async assignByRating(orderId, orderDetails) {
    const activePersons = this.deliveryPersons.filter(person => person.active)
    if (activePersons.length === 0) return null

    // Sort by rating (highest first)
    const sortedPersons = activePersons.sort((a, b) => b.rating - a.rating)
    
    // Check availability
    const assignments = await this.getCurrentAssignments()
    const availablePerson = sortedPersons.find(person => 
      (assignments[person.id] || 0) < person.maxOrders
    )

    return availablePerson || sortedPersons[0]
  }

  // Get current assignments for all delivery persons
  async getCurrentAssignments() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('delivery_person_id')
        .in('status', [this.config.orderStatus.outForDelivery, this.config.orderStatus.processing])
        .not('delivery_person_id', 'is', null)

      if (error) throw error

      const assignments = {}
      data.forEach(order => {
        const personId = order.delivery_person_id
        assignments[personId] = (assignments[personId] || 0) + 1
      })

      return assignments
    } catch (error) {
      console.error('Error getting current assignments:', error)
      return {}
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  // Get available collection time slots
  async getAvailableCollectionSlots(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]
      
      // Get existing bookings for the date
      const { data: existingBookings, error } = await supabase
        .from('orders')
        .select('collection_time_slot')
        .gte('created_at', `${targetDate}T00:00:00`)
        .lt('created_at', `${targetDate}T23:59:59`)
        .not('collection_time_slot', 'is', null)

      if (error) throw error

      // Count bookings per slot
      const slotBookings = {}
      existingBookings.forEach(booking => {
        const slot = booking.collection_time_slot
        slotBookings[slot] = (slotBookings[slot] || 0) + 1
      })

      // Return available slots
      return this.collectionTimeSlots.map(slot => ({
        ...slot,
        available: (slotBookings[slot.start] || 0) < slot.capacity,
        currentBookings: slotBookings[slot.start] || 0,
        remainingCapacity: slot.capacity - (slotBookings[slot.start] || 0)
      }))
    } catch (error) {
      console.error('Error getting collection slots:', error)
      return []
    }
  }

  // Get available delivery time slots
  async getAvailableDeliverySlots(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]
      
      // Get existing bookings for the date
      const { data: existingBookings, error } = await supabase
        .from('orders')
        .select('delivery_time_slot')
        .gte('created_at', `${targetDate}T00:00:00`)
        .lt('created_at', `${targetDate}T23:59:59`)
        .not('delivery_time_slot', 'is', null)

      if (error) throw error

      // Count bookings per slot
      const slotBookings = {}
      existingBookings.forEach(booking => {
        const slot = booking.delivery_time_slot
        slotBookings[slot] = (slotBookings[slot] || 0) + 1
      })

      // Return available slots
      return this.deliveryTimeSlots.map(slot => ({
        ...slot,
        available: (slotBookings[slot.start] || 0) < slot.capacity,
        currentBookings: slotBookings[slot.start] || 0,
        remainingCapacity: slot.capacity - (slotBookings[slot.start] || 0)
      }))
    } catch (error) {
      console.error('Error getting delivery slots:', error)
      return []
    }
  }

  // Auto-assign time slots based on order details
  async autoAssignTimeSlots(orderId, orderDetails = {}) {
    try {
      if (!import.meta.env.VITE_AUTO_TIME_ASSIGNMENT === 'true') {
        return null
      }

      const collectionSlots = await this.getAvailableCollectionSlots()
      const deliverySlots = await this.getAvailableDeliverySlots()

      // Find first available collection slot
      const availableCollectionSlot = collectionSlots.find(slot => slot.available)
      const availableDeliverySlot = deliverySlots.find(slot => slot.available)

      if (availableCollectionSlot && availableDeliverySlot) {
        // Update order with time slots
        const { error } = await supabase
          .from('orders')
          .update({
            collection_time_slot: availableCollectionSlot.start,
            delivery_time_slot: availableDeliverySlot.start,
            estimated_collection_time: `${new Date().toISOString().split('T')[0]}T${availableCollectionSlot.start}:00`,
            estimated_delivery_time: `${new Date().toISOString().split('T')[0]}T${availableDeliverySlot.start}:00`
          })
          .eq('id', orderId)

        if (error) throw error

        return {
          collectionSlot: availableCollectionSlot,
          deliverySlot: availableDeliverySlot
        }
      }

      return null
    } catch (error) {
      console.error('Error auto-assigning time slots:', error)
      throw error
    }
  }

  // Get delivery person performance
  async getDeliveryPersonPerformance(personId, dateFrom = null, dateTo = null) {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('delivery_person_id', personId)

      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate performance metrics
      const totalOrders = data.length
      const deliveredOrders = data.filter(order => order.status === this.config.orderStatus.delivered).length
      const cancelledOrders = data.filter(order => order.status === this.config.orderStatus.cancelled).length
      const avgDeliveryTime = this.calculateAverageDeliveryTime(data)
      const customerRating = this.calculateAverageRating(data)

      return {
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        deliveryRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
        avgDeliveryTime,
        customerRating
      }
    } catch (error) {
      console.error('Error getting delivery person performance:', error)
      throw error
    }
  }

  // Calculate average delivery time
  calculateAverageDeliveryTime(orders) {
    const deliveredOrders = orders.filter(order => 
      order.status === this.config.orderStatus.delivered && 
      order.actual_delivery_time
    )

    if (deliveredOrders.length === 0) return 0

    const totalTime = deliveredOrders.reduce((sum, order) => {
      const created = new Date(order.created_at)
      const delivered = new Date(order.actual_delivery_time)
      return sum + (delivered - created)
    }, 0)

    return totalTime / deliveredOrders.length / (1000 * 60) // Convert to minutes
  }

  // Calculate average rating
  calculateAverageRating(orders) {
    const ratedOrders = orders.filter(order => order.customer_rating)
    
    if (ratedOrders.length === 0) return 0

    const totalRating = ratedOrders.reduce((sum, order) => sum + order.customer_rating, 0)
    return totalRating / ratedOrders.length
  }
}

// Export singleton instance
export const deliveryService = new DeliveryService()
export default deliveryService
