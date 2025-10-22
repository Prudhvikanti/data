import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      recentlyViewed: [],
      maxItems: 20,

      // Add product to recently viewed
      addToRecentlyViewed: (product) => {
        const { recentlyViewed, maxItems } = get()
        
        // Remove if already exists
        const filtered = recentlyViewed.filter(item => item.id !== product.id)
        
        // Add to beginning
        const updated = [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            image_url: product.image_url,
            unit: product.unit,
            category_id: product.category_id,
            viewedAt: new Date().toISOString()
          },
          ...filtered
        ].slice(0, maxItems)
        
        set({ recentlyViewed: updated })
      },

      // Get recently viewed products
      getRecentlyViewed: (limit = 10) => {
        return get().recentlyViewed.slice(0, limit)
      },

      // Clear recently viewed
      clearRecentlyViewed: () => set({ recentlyViewed: [] })
    }),
    {
      name: 'quickcommerce-recently-viewed'
    }
  )
)

