import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import productsData from '../data/products.json'

// Cache for products and categories
let productsCache = null
let categoriesCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Custom hook to load products from Supabase or JSON fallback with caching
 */
export function useProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('database') // 'database' or 'json'
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if we have valid cached data
      const now = Date.now()
      if (productsCache && categoriesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        console.log('✅ Using cached products data')
        setProducts(productsCache)
        setCategories(categoriesCache)
        setSource('cache')
        setLoading(false)
        return
      }

      // Try to load from database first
      const dbData = await loadFromDatabase()
      if (dbData && dbData.products.length > 0) {
        setProducts(dbData.products)
        setCategories(dbData.categories)
        setSource('database')
        
        // Update cache
        productsCache = dbData.products
        categoriesCache = dbData.categories
        cacheTimestamp = Date.now()
        
        console.log('✅ Products loaded from database')
      } else {
        // Fallback to JSON
        loadFromJSON()
        setSource('json')
        console.log('✅ Products loaded from JSON')
      }
    } catch (error) {
      console.error('Error loading products:', error)
      // Fallback to JSON on error
      loadFromJSON()
      setSource('json')
      setError('Failed to load from database, using local data')
    } finally {
      setLoading(false)
    }
  }

  const loadFromDatabase = async () => {
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('name')

      if (productsError) throw productsError

      if (productsData && productsData.length > 0) {
        return {
          products: productsData,
          categories: categoriesData || []
        }
      }

      return null
    } catch (error) {
      console.error('Database load error:', error)
      return null
    }
  }

  const loadFromJSON = () => {
    try {
      // Create category map
      const categoryMap = {}
      const formattedCategories = productsData.categories.map((cat, index) => ({
        id: `cat-${index}`,
        name: cat.name,
        emoji: cat.emoji,
        description: cat.description || ''
      }))

      formattedCategories.forEach(cat => {
        categoryMap[cat.name] = cat.id
      })

      // Format products with category IDs and enhanced data
      const formattedProducts = productsData.products.map((product, index) => ({
        id: `prod-${index}`,
        category_id: categoryMap[product.category],
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        discount: product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0,
        unit: product.unit,
        featured: product.featured || false,
        image_url: product.image_url,
        in_stock: true,
        rating: product.rating || 4.0,
        reviews: product.reviews || 0
      }))

      setCategories(formattedCategories)
      setProducts(formattedProducts)
      
      // Update cache
      productsCache = formattedProducts
      categoriesCache = formattedCategories
      cacheTimestamp = Date.now()
      
      console.log(`✅ Loaded ${formattedProducts.length} products from JSON`)
    } catch (error) {
      console.error('Error loading from JSON:', error)
      setError('Failed to load products')
    }
  }

  const refreshProducts = () => {
    // Clear cache and reload
    productsCache = null
    categoriesCache = null
    cacheTimestamp = null
    loadData()
  }

  const clearCache = () => {
    productsCache = null
    categoriesCache = null
    cacheTimestamp = null
    console.log('✅ Products cache cleared')
  }

  return {
    products,
    categories,
    loading,
    source,
    error,
    refreshProducts,
    clearCache
  }
}

/**
 * Hook for filtered and sorted products with memoization
 */
export function useFilteredProducts(searchQuery = '', categoryFilter = '', sortBy = 'name') {
  const { products, categories, loading, source, error } = useProducts()

  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category_id === categoryFilter)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'featured':
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'discount':
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0))
        break
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [products, searchQuery, categoryFilter, sortBy])

  // Get category information
  const currentCategory = useMemo(() => {
    if (!categoryFilter) return null
    return categories.find(cat => cat.id === categoryFilter)
  }, [categories, categoryFilter])

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    currentCategory,
    loading,
    source,
    error,
    totalCount: products.length,
    filteredCount: filteredProducts.length
  }
}

/**
 * Hook to get product by ID
 */
export function useProduct(productId) {
  const { products, loading } = useProducts()

  const product = useMemo(() => {
    return products.find(p => p.id === productId)
  }, [products, productId])

  return {
    product,
    loading
  }
}

/**
 * Hook to get products by category
 */
export function useProductsByCategory(categoryId) {
  const { products, loading, categories } = useProducts()

  const categoryProducts = useMemo(() => {
    if (!categoryId) return products
    return products.filter(p => p.category_id === categoryId)
  }, [products, categoryId])

  const category = useMemo(() => {
    return categories.find(c => c.id === categoryId)
  }, [categories, categoryId])

  return {
    products: categoryProducts,
    category,
    loading
  }
}

/**
 * Hook to get featured products
 */
export function useFeaturedProducts(limit = 10) {
  const { products, loading } = useProducts()

  const featuredProducts = useMemo(() => {
    return products
      .filter(p => p.featured)
      .slice(0, limit)
  }, [products, limit])

  return {
    products: featuredProducts,
    loading
  }
}
