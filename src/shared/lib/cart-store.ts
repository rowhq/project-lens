/**
 * Marketplace Cart Store
 * Zustand store for managing shopping cart state
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  listingId: string;
  title: string;
  price: number;
  property?: {
    city: string;
    state: string;
  };
  reportType: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getPlatformFee: () => number;
  getItemCount: () => number;
  hasItem: (listingId: string) => boolean;
}

// Platform fee is 20%
export const PLATFORM_FEE_PERCENTAGE = 0.20;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => {
        const { items } = get();
        // Prevent duplicates
        if (items.some((i) => i.listingId === item.listingId)) {
          return;
        }
        set({ items: [...items, item] });
      },

      removeItem: (listingId: string) => {
        const { items } = get();
        set({ items: items.filter((i) => i.listingId !== listingId) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price, 0);
      },

      getPlatformFee: () => {
        const total = get().getTotal();
        return total * PLATFORM_FEE_PERCENTAGE;
      },

      getItemCount: () => {
        return get().items.length;
      },

      hasItem: (listingId: string) => {
        return get().items.some((i) => i.listingId === listingId);
      },
    }),
    {
      name: "marketplace-cart",
    }
  )
);
