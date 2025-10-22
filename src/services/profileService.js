import { supabase } from '../lib/supabase'

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data
}

/**
 * Create or update user profile
 */
export async function saveUserProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      full_name: profileData.full_name,
      phone: profileData.phone,
      avatar_url: profileData.avatar_url || null,
      date_of_birth: profileData.date_of_birth || null,
      profile_completed: true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Check if profile is completed
 */
export async function isProfileCompleted(userId) {
  const profile = await getUserProfile(userId)
  return profile?.profile_completed || false
}

/**
 * Save delivery address
 */
export async function saveDeliveryAddress(userId, addressData) {
  // If this is set as default, we need to unset other defaults first
  if (addressData.is_default) {
    await supabase
      .from('delivery_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
  }

  const { data, error } = await supabase
    .from('delivery_addresses')
    .insert({
      user_id: userId,
      label: addressData.label || 'Home',
      full_name: addressData.full_name,
      phone: addressData.phone,
      door_number: addressData.door_number || null,
      street_address: addressData.street_address,
      landmark: addressData.landmark || null,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null,
      is_default: addressData.is_default || false
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all delivery addresses for user
 */
export async function getDeliveryAddresses(userId) {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get default delivery address
 */
export async function getDefaultAddress(userId) {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data
}

/**
 * Update delivery address
 */
export async function updateDeliveryAddress(addressId, addressData) {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .update({
      ...addressData,
      updated_at: new Date().toISOString()
    })
    .eq('id', addressId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete delivery address
 */
export async function deleteDeliveryAddress(addressId) {
  const { error } = await supabase
    .from('delivery_addresses')
    .delete()
    .eq('id', addressId)

  if (error) throw error
  return true
}

/**
 * Set default address
 */
export async function setDefaultDeliveryAddress(userId, addressId) {
  // First, unset all default addresses
  await supabase
    .from('delivery_addresses')
    .update({ is_default: false })
    .eq('user_id', userId)

  // Then set the selected address as default
  const { data, error } = await supabase
    .from('delivery_addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create order with full details
 */
export async function createOrder(userId, orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: orderData.total_amount,
      delivery_fee: orderData.delivery_fee || 0,
      status: 'pending',
      delivery_address: orderData.delivery_address,
      delivery_address_id: orderData.delivery_address_id || null,
      phone: orderData.phone,
      payment_method: orderData.payment_method || 'cod',
      payment_type: orderData.payment_type || 'cod',
      payment_status: orderData.payment_status || 'pending',
      transaction_id: orderData.transaction_id || null,
      delivery_instructions: orderData.delivery_instructions || null,
      estimated_delivery_time: orderData.estimated_delivery_time || null
    })
    .select()
    .single()

  if (error) throw error

  // Create order tracking entry
  await createOrderTracking(data.id, 'pending', 'Order placed successfully')

  return data
}

/**
 * Create order tracking entry
 */
export async function createOrderTracking(orderId, status, message) {
  const { data, error } = await supabase
    .from('order_tracking')
    .insert({
      order_id: orderId,
      status: status,
      message: message || null
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get order tracking history
 */
export async function getOrderTracking(orderId) {
  const { data, error } = await supabase
    .from('order_tracking')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status, message) {
  // Update order
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: status,
      updated_at: new Date().toISOString(),
      ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {})
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error

  // Add tracking entry
  await createOrderTracking(orderId, status, message)

  return data
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(orderId, paymentStatus, transactionId = null) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: paymentStatus,
      transaction_id: transactionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}


