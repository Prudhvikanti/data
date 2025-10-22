// Debug Order Creation
// Run this to test order creation step by step

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xifvcnyqounfbmcgzwen.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Supabase anon key not found!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugOrderCreation() {
  console.log('🔍 Debugging Order Creation...\n')

  try {
    // Test 1: Check if user is authenticated
    console.log('1. Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Not authenticated:', authError?.message)
      console.log('💡 Please login to the app first')
      return
    }

    console.log('✅ Authenticated as:', user.email)

    // Test 2: Check if tables exist
    console.log('\n2. Checking database tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('orders')
      .select('id')
      .limit(1)

    if (tablesError) {
      console.error('❌ Database error:', tablesError.message)
      console.log('💡 Run the database setup SQL in Supabase first')
      console.log('💡 File: ZERO_ERRORS_SUPABASE.sql')
      return
    }

    console.log('✅ Tables exist and accessible')

    // Test 3: Try to create a test order
    console.log('\n3. Creating test order...')

    const testOrder = {
      user_id: user.id,
      total_amount: 99.99,
      delivery_fee: 0,
      status: 'pending',
      delivery_address: 'Test Address, Test City',
      phone: '9999999999',
      payment_method: 'cod',
      payment_type: 'cod',
      payment_status: 'pending'
    }

    console.log('📝 Order data:', testOrder)

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single()

    if (orderError) {
      console.error('❌ Order creation failed:', orderError.message)
      console.error('❌ Error code:', orderError.code)
      console.error('❌ Error details:', orderError.details)

      if (orderError.message.includes('uuid')) {
        console.log('💡 UUID issue detected!')
        console.log('💡 Run ZERO_ERRORS_SUPABASE.sql to fix UUID issues')
      }
      return
    }

    console.log('✅ Order created successfully!')
    console.log('📦 Order ID:', orderData.id)
    console.log('📦 Order Status:', orderData.status)

    // Test 4: Clean up (optional)
    console.log('\n4. Cleaning up test order...')
    await supabase.from('orders').delete().eq('id', orderData.id)

    console.log('✅ Test completed successfully!')
    console.log('\n🎉 If this worked, order creation is working!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

debugOrderCreation()
