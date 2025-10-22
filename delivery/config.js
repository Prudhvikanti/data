// Delivery Configuration
export const deliveryConfig = {
  // Delivery time estimates (in minutes)
  timeEstimates: {
    preparation: 15,
    pickup: 10,
    delivery: 20,
    total: 45
  },
  
  // Delivery zones
  zones: {
    'Samalkota': {
      radius: 5, // km
      baseTime: 20,
      multiplier: 1.0
    },
    'Kakinada': {
      radius: 10,
      baseTime: 30,
      multiplier: 1.2
    },
    'Rajahmundry': {
      radius: 15,
      baseTime: 45,
      multiplier: 1.5
    }
  },
  
  // Delivery person capacity
  capacity: {
    maxOrders: 5,
    maxDistance: 20, // km
    workingHours: {
      start: 8, // 8 AM
      end: 22   // 10 PM
    }
  }
}

// Delivery Helper Functions
export const deliveryHelpers = {
  // Calculate delivery time based on distance and zone
  calculateDeliveryTime: (distance, zone) => {
    const zoneConfig = deliveryConfig.zones[zone] || deliveryConfig.zones['Samalkota']
    const baseTime = zoneConfig.baseTime
    const multiplier = zoneConfig.multiplier
    
    return Math.round(baseTime + (distance * multiplier))
  },
  
  // Check if delivery person is available
  isDeliveryPersonAvailable: (deliveryPerson, currentTime) => {
    const { workingHours } = deliveryConfig.capacity
    const hour = new Date(currentTime).getHours()
    
    return hour >= workingHours.start && hour <= workingHours.end
  },
  
  // Calculate optimal route
  calculateOptimalRoute: (orders) => {
    // Simple implementation - in production, use proper routing algorithm
    return orders.sort((a, b) => {
      const distanceA = a.distance || 0
      const distanceB = b.distance || 0
      return distanceA - distanceB
    })
  },
  
  // Get delivery status color
  getStatusColor: (status) => {
    const colors = {
      'pending': 'text-yellow-600',
      'assigned': 'text-blue-600',
      'picked_up': 'text-purple-600',
      'in_transit': 'text-orange-600',
      'delivered': 'text-green-600',
      'cancelled': 'text-red-600'
    }
    return colors[status] || 'text-gray-600'
  },
  
  // Format delivery time
  formatDeliveryTime: (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
}
