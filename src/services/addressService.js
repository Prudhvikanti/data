import { supabase } from '../lib/supabase'

/**
 * Get all addresses for current user
 */
export async function getUserAddresses(userId) {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching addresses:', error)
    throw error
  }
}

/**
 * Get default address for user
 */
export async function getDefaultAddress(userId) {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore "not found" error
    return data
  } catch (error) {
    console.error('Error fetching default address:', error)
    return null
  }
}

/**
 * Save new address
 */
export async function saveAddress(userId, addressData) {
  try {
    // If this is set as default, unset other defaults
    if (addressData.is_default) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        ...addressData
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving address:', error)
    throw error
  }
}

/**
 * Update existing address
 */
export async function updateAddress(addressId, addressData) {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .update(addressData)
      .eq('id', addressId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating address:', error)
    throw error
  }
}

/**
 * Delete address
 */
export async function deleteAddress(addressId) {
  try {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting address:', error)
    throw error
  }
}

/**
 * Set address as default
 */
export async function setDefaultAddress(userId, addressId) {
  try {
    // Unset all defaults first
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', userId)

    // Set new default
    const { data, error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error setting default address:', error)
    throw error
  }
}

