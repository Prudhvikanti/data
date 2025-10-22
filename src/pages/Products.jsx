import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { Filter, Database, FileJson, Grid3x3, LayoutGrid, SlidersHorizontal } from 'lucide-react'
import { useFilteredProducts } from '../hooks/useProducts'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'compact'
  const [sortBy, setSortBy] = useState('name') // 'name', 'price-low', 'price-high', 'featured'

  const searchQuery = searchParams.get('search') || ''
  const categoryFilter = searchParams.get('category') || ''

  const { products, categories, loading, source, error } = useFilteredProducts(
    searchQuery,
    categoryFilter,
    sortBy
  )

  const handleCategoryChange = (categoryId) => {
    if (categoryId) {
      searchParams.set('category', categoryId)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasFilters = searchQuery || categoryFilter

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-3 md:py-6">
        {/* Header */}
        <div className="mb-3 md:mb-5">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn-secondary p-2"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* View Controls & Sort */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Compact view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-600 hidden md:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Chips - Mobile Horizontal Scroll */}
        <div className="md:hidden mb-4 -mx-3 px-3 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => handleCategoryChange('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                !categoryFilter
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  categoryFilter === category.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300'
                }`}
              >
                <span>{category.emoji}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop Only */}
          <aside className="hidden md:block">
            <div className="card sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary-600" />
                  Filters
                </h2>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      !categoryFilter
                        ? 'bg-primary-100 text-primary-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">📦</span>
                    <span>All Categories</span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        categoryFilter === category.id
                          ? 'bg-primary-100 text-primary-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{category.emoji}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Info */}
              {products.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Price Range</h3>
                  <p className="text-sm text-gray-600">
                    ₹{Math.min(...products.map(p => p.price)).toFixed(2)} - 
                    ₹{Math.max(...products.map(p => p.price)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {error ? (
              <div className="card p-8 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Unable to Load Products
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                  <p className="font-semibold text-yellow-800 mb-2">Setup Required:</p>
                  <ol className="text-sm text-yellow-700 space-y-1 ml-4 list-decimal">
                    <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                    <li>Add credentials to your <code className="bg-yellow-100 px-1 rounded">.env</code> file</li>
                    <li>Run <code className="bg-yellow-100 px-1 rounded">database.sql</code> in Supabase SQL Editor</li>
                    <li>Restart the dev server</li>
                  </ol>
                </div>
                <button onClick={loadProducts} className="btn-primary">
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <div className={`product-grid ${viewMode === 'compact' ? 'product-grid-compact' : 'product-grid-normal'}`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="card h-72 md:h-80 skeleton" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`product-grid ${viewMode === 'compact' ? 'product-grid-compact' : 'product-grid-normal'}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} compact={viewMode === 'compact'} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  {hasFilters ? 'Try adjusting your search or filters' : 'Please set up your database first'}
                </p>
                {hasFilters ? (
                  <button onClick={clearFilters} className="btn-primary">
                    Clear Filters
                  </button>
                ) : (
                  <div className="text-sm text-gray-500">
                    <p>See <code className="bg-gray-100 px-2 py-1 rounded">QUICK_START.md</code> for setup instructions</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

