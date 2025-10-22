import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAddressStore = create(
  persist(
    (set, get) => ({
      addresses: [],
      currentAddress: null,
      
      // Add new address
      addAddress: (addressData) => {
        const newAddress = {
          id: `addr_${Date.now()}`,
          ...addressData,
          createdAt: new Date().toISOString(),
          isDefault: get().addresses.length === 0 // First address is default
        }
        
        set(state => ({
          addresses: [...state.addresses, newAddress],
          currentAddress: newAddress
        }))
        
        return newAddress
      },
      
      // Update existing address
      updateAddress: (id, addressData) => {
        set(state => ({
          addresses: state.addresses.map(addr => 
            addr.id === id ? { ...addr, ...addressData, updatedAt: new Date().toISOString() } : addr
          )
        }))
      },
      
      // Delete address
      deleteAddress: (id) => {
        set(state => {
          const newAddresses = state.addresses.filter(addr => addr.id !== id)
          return {
            addresses: newAddresses,
            currentAddress: state.currentAddress?.id === id ? newAddresses[0] || null : state.currentAddress
          }
        })
      },
      
      // Set current address
      setCurrentAddress: (address) => {
        set({ currentAddress: address })
      },
      
      // Set address as default
      setDefaultAddress: (id) => {
        set(state => ({
          addresses: state.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
          }))
        }))
      },
      
      // Get default address
      getDefaultAddress: () => {
        return get().addresses.find(addr => addr.isDefault) || get().addresses[0] || null
      },
      
      // Clear all addresses
      clearAllAddresses: () => {
        set({ addresses: [], currentAddress: null })
      }
    }),
    {
      name: 'address-storage',
      partialize: (state) => ({ 
        addresses: state.addresses,
        currentAddress: state.currentAddress 
      })
    }
  )
)
