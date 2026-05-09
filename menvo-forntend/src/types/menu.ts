export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  weight?: string
  imageUrl?: string
  isAvailable: boolean
  preparationTime?: number // in minutes
  dietaryPreference?: 'veg' | 'non-veg' | 'vegan'
  deliveryMinutes?: number
  discountPercent?: number
}

export interface Category {
  id: string
  name: string
  icon?: string
  emoji?: string
  thumbnailUrl?: string
  items: MenuItem[]
}

export interface Table {
  id: string
  seats: number
  status: 'empty' | 'scanned' | 'ordered'
  label: string
}

export interface Restaurant {
  id: string
  name: string
  slug: string
  bio?: string
  address?: string
  currency?: string
  logoUrl?: string
  categories: Category[]
  tables?: Table[]
}

export interface RestaurantMenu {
  slug: string
  restaurantName: string
  address?: string
  logoUrl?: string
  currency?: string
  categories: Category[]
}
