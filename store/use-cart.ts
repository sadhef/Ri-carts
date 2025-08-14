import { create } from 'zustand'
import { persist, createJSONStorage, StateCreator } from 'zustand/middleware'

export type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  comparePrice?: number
  image: string
  quantity: number
  stock: number
  sku: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  total: number
  subtotal: number
  savings: number
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const calculateItemCount = (items: CartItem[]) => 
  Array.isArray(items) ? items.reduce((total, item) => total + (item?.quantity || 0), 0) : 0

const calculateSubtotal = (items: CartItem[]) => 
  Array.isArray(items) ? items.reduce((total, item) => total + (item?.price || 0) * (item?.quantity || 0), 0) : 0

const calculateSavings = (items: CartItem[]) => 
  Array.isArray(items) ? items.reduce((total, item) => {
    if (item?.comparePrice && item.comparePrice > (item?.price || 0)) {
      return total + (item.comparePrice - (item?.price || 0)) * (item?.quantity || 0)
    }
    return total
  }, 0) : 0

const cartStore = (set: any, get: any) => ({
  items: [],
  isLoading: false,
  itemCount: 0,
  subtotal: 0,
  savings: 0,
  total: 0,
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  addItem: (item: Omit<CartItem, 'id'>) => {
    set((state: CartStore) => {
      const existingItem = state.items.find(
        (i) => i.productId === item.productId
      )

      let newItems
      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + item.quantity,
          item.stock
        )
        newItems = state.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: newQuantity }
            : i
        )
      } else {
        newItems = [
          ...state.items,
          { 
            ...item, 
            id: `cart_${item.productId}_${Date.now()}`,
            quantity: Math.min(item.quantity, item.stock)
          },
        ]
      }

      const itemCount = calculateItemCount(newItems)
      const subtotal = calculateSubtotal(newItems)
      const savings = calculateSavings(newItems)

      return {
        items: newItems,
        itemCount,
        subtotal,
        savings,
        total: subtotal,
      }
    })
  },
  removeItem: (productId: string) => {
    set((state: CartStore) => {
      const newItems = state.items.filter((item) => item.productId !== productId)
      const itemCount = calculateItemCount(newItems)
      const subtotal = calculateSubtotal(newItems)
      const savings = calculateSavings(newItems)

      return {
        items: newItems,
        itemCount,
        subtotal,
        savings,
        total: subtotal,
      }
    })
  },
  updateQuantity: (productId: string, quantity: number) => {
    if (quantity < 1) {
      get().removeItem(productId)
      return
    }

    set((state: CartStore) => {
      const newItems = state.items.map((item) =>
        item.productId === productId 
          ? { ...item, quantity: Math.min(quantity, item.stock) } 
          : item
      )
      
      const itemCount = calculateItemCount(newItems)
      const subtotal = calculateSubtotal(newItems)
      const savings = calculateSavings(newItems)

      return {
        items: newItems,
        itemCount,
        subtotal,
        savings,
        total: subtotal,
      }
    })
  },
  clearCart: () => set({ 
    items: [], 
    itemCount: 0, 
    subtotal: 0, 
    savings: 0, 
    total: 0 
  }),
})

const cartStoreWithPersist: StateCreator<
  CartStore,
  [],
  [["zustand/persist", unknown]]
> = persist(
  cartStore as StateCreator<CartStore, [], []>,
  {
    name: 'shopping-cart',
    storage: createJSONStorage(() => localStorage),
    skipHydration: true,
  }
)

export const useCart = create<CartStore>()(cartStoreWithPersist)