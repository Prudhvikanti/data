import { supabase } from '../lib/supabase'
import productsData from '../data/products.json'

export async function importProductsFromJSON() {
  try {
    console.log('Starting import from products.json...')
    
    // First, import categories
    console.log('Importing categories...')
    const categoryMap = {}
    
    for (const category of productsData.categories) {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          emoji: category.emoji
        })
        .select()
        .single()
      
      if (error) {
        // Category might already exist, try to fetch it
        const { data: existing } = await supabase
          .from('categories')
          .select('*')
          .eq('name', category.name)
          .single()
        
        if (existing) {
          categoryMap[category.name] = existing.id
          console.log(`Category "${category.name}" already exists`)
        } else {
          console.error(`Error with category "${category.name}":`, error)
        }
      } else {
        categoryMap[category.name] = data.id
        console.log(`✓ Imported category: ${category.name}`)
      }
    }
    
    // Then, import products
    console.log('\nImporting products...')
    let successCount = 0
    let errorCount = 0
    
    for (const product of productsData.products) {
      const categoryId = categoryMap[product.category]
      
      if (!categoryId) {
        console.error(`Category "${product.category}" not found for product "${product.name}"`)
        errorCount++
        continue
      }
      
      const { error } = await supabase
        .from('products')
        .insert({
          category_id: categoryId,
          name: product.name,
          description: product.description,
          price: product.price,
          original_price: product.original_price,
          unit: product.unit,
          featured: product.featured,
          image_url: product.image_url,
          in_stock: true
        })
      
      if (error) {
        console.error(`Error importing "${product.name}":`, error.message)
        errorCount++
      } else {
        console.log(`✓ Imported: ${product.name}`)
        successCount++
      }
    }
    
    console.log('\n=== Import Summary ===')
    console.log(`✓ Successfully imported: ${successCount} products`)
    if (errorCount > 0) {
      console.log(`✗ Failed: ${errorCount} products`)
    }
    console.log('======================\n')
    
    return {
      success: true,
      imported: successCount,
      failed: errorCount
    }
    
  } catch (error) {
    console.error('Fatal error during import:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// For use in browser console
if (typeof window !== 'undefined') {
  window.importProductsFromJSON = importProductsFromJSON
}

