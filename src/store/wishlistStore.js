import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],

      // Add item to wishlist
      addToWishlist: (product) => {
        const { wishlist } = get()
        
        // Check if already in wishlist
        if (wishlist.find(item => item.id === product.id)) {
          return false
        }

        set({
          wishlist: [...wishlist, {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            addedAt: new Date().toISOString()
          }]
        })
        
        return true
      },

      // Remove from wishlist
      removeFromWishlist: (productId) => {
        set({
          wishlist: get().wishlist.filter(item => item.id !== productId)
        })
      },

      // Check if in wishlist
      isInWishlist: (productId) => {
        return get().wishlist.some(item => item.id === productId)
      },

      // Toggle wishlist
      toggleWishlist: (product) => {
        const { isInWishlist, addToWishlist, removeFromWishlist } = get()
        
        if (isInWishlist(product.id)) {
          removeFromWishlist(product.id)
          return false
        } else {
          addToWishlist(product)
          return true
        }
      },

      // Clear wishlist
      clearWishlist: () => set({ wishlist: [] }),

      // Get wishlist count
      getWishlistCount: () => get().wishlist.length
    }),
    {
      name: 'quickcommerce-wishlist'
    }
  )
)

