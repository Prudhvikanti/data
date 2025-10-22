import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Sample restaurants data
const sampleRestaurants = [
  {
    id: 'rest-1',
    name: "Biryani House",
    cuisine: "Indian",
    rating: 4.5,
    deliveryTime: "25-30 min",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
    priceRange: "₹₹",
    offers: "50% off up to ₹100",
    isOpen: true,
    latitude: 17.0005,
    longitude: 82.2400
  },
  {
    id: 'rest-2',
    name: "Pizza Paradise",
    cuisine: "Italian",
    rating: 4.3,
    deliveryTime: "20-25 min",
    distance: "0.8 km",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
    priceRange: "₹₹₹",
    offers: "Free delivery",
    isOpen: true,
    latitude: 17.0010,
    longitude: 82.2410
  },
  {
    id: 'rest-3',
    name: "Burger King",
    cuisine: "American",
    rating: 4.1,
    deliveryTime: "15-20 min",
    distance: "0.5 km",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    priceRange: "₹₹",
    offers: "Buy 1 Get 1",
    isOpen: true,
    latitude: 17.0015,
    longitude: 82.2420
  },
  {
    id: 'rest-4',
    name: "Chinese Wok",
    cuisine: "Chinese",
    rating: 4.4,
    deliveryTime: "30-35 min",
    distance: "1.5 km",
    image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=500",
    priceRange: "₹₹",
    offers: "20% off",
    isOpen: true,
    latitude: 17.0020,
    longitude: 82.2430
  },
  {
    id: 'rest-5',
    name: "South Indian Delights",
    cuisine: "South Indian",
    rating: 4.6,
    deliveryTime: "20-25 min",
    distance: "1.0 km",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=500",
    priceRange: "₹",
    offers: "Free item on orders above ₹299",
    isOpen: true,
    latitude: 17.0008,
    longitude: 82.2405
  },
  {
    id: 'rest-6',
    name: "Tandoor Nights",
    cuisine: "North Indian",
    rating: 4.2,
    deliveryTime: "25-30 min",
    distance: "1.8 km",
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=500",
    priceRange: "₹₹₹",
    offers: "Flat 30% off",
    isOpen: false,
    latitude: 17.0025,
    longitude: 82.2440
  }
]

// Sample menu items for each restaurant
const restaurantMenus = {
  'rest-1': [
    { id: 'item-1-1', name: "Chicken Biryani", description: "Aromatic basmati rice with tender chicken", price: 249, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300", category: "Biryani", isVeg: false, rating: 4.5 },
    { id: 'item-1-2', name: "Mutton Biryani", description: "Rich and flavorful mutton biryani", price: 299, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300", category: "Biryani", isVeg: false, rating: 4.6 },
    { id: 'item-1-3', name: "Veg Biryani", description: "Mixed vegetables with fragrant rice", price: 199, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300", category: "Biryani", isVeg: true, rating: 4.3 },
    { id: 'item-1-4', name: "Raita", description: "Cool yogurt with cucumber and spices", price: 49, image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=300", category: "Sides", isVeg: true, rating: 4.2 },
    { id: 'item-1-5', name: "Gulab Jamun", description: "Sweet milk balls in sugar syrup", price: 59, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300", category: "Desserts", isVeg: true, rating: 4.4 }
  ],
  'rest-2': [
    { id: 'item-2-1', name: "Margherita Pizza", description: "Classic tomato, mozzarella, basil", price: 349, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300", category: "Pizza", isVeg: true, rating: 4.5 },
    { id: 'item-2-2', name: "Pepperoni Pizza", description: "Loaded with pepperoni and cheese", price: 449, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300", category: "Pizza", isVeg: false, rating: 4.6 },
    { id: 'item-2-3', name: "Pasta Alfredo", description: "Creamy white sauce pasta", price: 299, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300", category: "Pasta", isVeg: true, rating: 4.4 },
    { id: 'item-2-4', name: "Garlic Bread", description: "Toasted bread with garlic butter", price: 129, image: "https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=300", category: "Sides", isVeg: true, rating: 4.3 },
    { id: 'item-2-5', name: "Tiramisu", description: "Italian coffee-flavored dessert", price: 199, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300", category: "Desserts", isVeg: true, rating: 4.7 }
  ],
  'rest-3': [
    { id: 'item-3-1', name: "Classic Burger", description: "Beef patty with lettuce and tomato", price: 149, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", category: "Burgers", isVeg: false, rating: 4.2 },
    { id: 'item-3-2', name: "Cheese Burger", description: "Double cheese with beef patty", price: 179, image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=300", category: "Burgers", isVeg: false, rating: 4.4 },
    { id: 'item-3-3', name: "Veggie Burger", description: "Grilled veggie patty", price: 129, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300", category: "Burgers", isVeg: true, rating: 4.1 },
    { id: 'item-3-4', name: "French Fries", description: "Crispy golden fries", price: 99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300", category: "Sides", isVeg: true, rating: 4.3 },
    { id: 'item-3-5', name: "Chocolate Shake", description: "Thick chocolate milkshake", price: 129, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300", category: "Beverages", isVeg: true, rating: 4.5 }
  ],
  'rest-4': [
    { id: 'item-4-1', name: "Hakka Noodles", description: "Stir-fried noodles with vegetables", price: 179, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300", category: "Noodles", isVeg: true, rating: 4.4 },
    { id: 'item-4-2', name: "Fried Rice", description: "Wok-tossed rice with vegetables", price: 169, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300", category: "Rice", isVeg: true, rating: 4.3 },
    { id: 'item-4-3', name: "Manchurian", description: "Crispy veggie balls in spicy sauce", price: 199, image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=300", category: "Starters", isVeg: true, rating: 4.5 },
    { id: 'item-4-4', name: "Spring Rolls", description: "Crispy vegetable rolls", price: 149, image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300", category: "Starters", isVeg: true, rating: 4.2 },
    { id: 'item-4-5', name: "Hot & Sour Soup", description: "Spicy and tangy soup", price: 129, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300", category: "Soups", isVeg: true, rating: 4.3 }
  ],
  'rest-5': [
    { id: 'item-5-1', name: "Masala Dosa", description: "Crispy crepe with spiced potato", price: 89, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300", category: "Dosa", isVeg: true, rating: 4.6 },
    { id: 'item-5-2', name: "Idli Sambar", description: "Steamed rice cakes with lentil curry", price: 69, image: "https://images.unsplash.com/photo-1589301773859-b9de643853f0?w=300", category: "Breakfast", isVeg: true, rating: 4.5 },
    { id: 'item-5-3', name: "Medu Vada", description: "Crispy lentil donuts", price: 79, image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300", category: "Breakfast", isVeg: true, rating: 4.4 },
    { id: 'item-5-4', name: "Uttapam", description: "Thick pancake with toppings", price: 99, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300", category: "Dosa", isVeg: true, rating: 4.3 },
    { id: 'item-5-5', name: "Filter Coffee", description: "South Indian style coffee", price: 49, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300", category: "Beverages", isVeg: true, rating: 4.7 }
  ],
  'rest-6': [
    { id: 'item-6-1', name: "Butter Chicken", description: "Creamy tomato-based chicken curry", price: 299, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300", category: "Main Course", isVeg: false, rating: 4.6 },
    { id: 'item-6-2', name: "Dal Makhani", description: "Black lentils in buttery gravy", price: 199, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300", category: "Main Course", isVeg: true, rating: 4.5 },
    { id: 'item-6-3', name: "Tandoori Chicken", description: "Marinated chicken from clay oven", price: 349, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300", category: "Tandoor", isVeg: false, rating: 4.7 },
    { id: 'item-6-4', name: "Garlic Naan", description: "Leavened bread with garlic", price: 59, image: "https://images.unsplash.com/photo-1593759608136-45c5d1b4b8e4?w=300", category: "Breads", isVeg: true, rating: 4.4 },
    { id: 'item-6-5', name: "Kulfi", description: "Traditional Indian ice cream", price: 79, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300", category: "Desserts", isVeg: true, rating: 4.6 }
  ]
}

export const useRestaurantStore = create(
  persist(
    (set, get) => ({
      restaurants: sampleRestaurants,
      restaurantMenus: restaurantMenus,
      selectedRestaurant: null,
      userLocation: null,

      // Get all restaurants
      getRestaurants: () => get().restaurants,

      // Get restaurants by filter
      getRestaurantsByFilter: (filter) => {
        const restaurants = get().restaurants
        
        if (filter === 'all') return restaurants
        if (filter === 'nearby') return restaurants.filter(r => parseFloat(r.distance) < 2)
        if (filter === 'open') return restaurants.filter(r => r.isOpen)
        if (filter === 'offers') return restaurants.filter(r => r.offers)
        
        // By cuisine
        return restaurants.filter(r => r.cuisine.toLowerCase() === filter.toLowerCase())
      },

      // Set selected restaurant
      setSelectedRestaurant: (restaurantId) => {
        const restaurant = get().restaurants.find(r => r.id === restaurantId)
        set({ selectedRestaurant: restaurant })
      },

      // Get menu for restaurant
      getRestaurantMenu: (restaurantId) => {
        return get().restaurantMenus[restaurantId] || []
      },

      // Get menu items by category
      getMenuByCategory: (restaurantId) => {
        const menu = get().restaurantMenus[restaurantId] || []
        const categories = {}
        
        menu.forEach(item => {
          if (!categories[item.category]) {
            categories[item.category] = []
          }
          categories[item.category].push(item)
        })
        
        return categories
      },

      // Set user location
      setUserLocation: (location) => set({ userLocation: location }),

      // Calculate distance (simple approximation)
      calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371 // Radius of Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c
        return distance.toFixed(1)
      }
    }),
    {
      name: 'quickcommerce-restaurants'
    }
  )
)

