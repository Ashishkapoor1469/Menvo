import { create } from 'zustand'
import type { Restaurant } from '../types/menu'

interface RestaurantState {
  restaurants: Restaurant[]
  activeRestaurantSlug: string | null
  setRestaurants: (restaurants: Restaurant[]) => void
  setActiveRestaurant: (slug: string) => void
  addRestaurant: (restaurant: Restaurant) => void
  clearRestaurants: () => void
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurants: [],
  activeRestaurantSlug: localStorage.getItem('activeRestaurantSlug'),
  setRestaurants: (restaurants) => {
    set({ restaurants })
    // Auto-set first restaurant if none active
    if (!localStorage.getItem('activeRestaurantSlug') && restaurants.length > 0) {
      localStorage.setItem('activeRestaurantSlug', restaurants[0].slug)
      set({ activeRestaurantSlug: restaurants[0].slug })
    }
  },
  setActiveRestaurant: (slug) => {
    localStorage.setItem('activeRestaurantSlug', slug)
    set({ activeRestaurantSlug: slug })
  },
  addRestaurant: (restaurant) =>
    set((state) => {
      localStorage.setItem('activeRestaurantSlug', restaurant.slug)
      return {
        restaurants: [...state.restaurants, restaurant],
        activeRestaurantSlug: restaurant.slug,
      }
    }),
  clearRestaurants: () => {
    localStorage.removeItem('activeRestaurantSlug')
    set({ restaurants: [], activeRestaurantSlug: null })
  },
}))
