import { env } from '../config/env'
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '../types/auth'
import type { Category, MenuItem, Restaurant, RestaurantMenu } from '../types/menu'
import { useAuthStore } from '../store/authStore'

const API_PREFIX = 'menvo/v1'
const DEFAULT_API_URL = `http://localhost:3000/${API_PREFIX}`
const BASE_URL = (env.apiBaseUrl || DEFAULT_API_URL).replace(/\/$/, '')

interface BackendAuthResponse {
  accessToken: string
  user?: Partial<AuthUser> & { name?: string }
}

export interface RestaurantRegisterPayload {
  restaurantName: string
  restaurantBio?: string
}

export interface UpdateRestaurantPayload {
  restaurantName?: string
  restaurantBio?: string
  logoUrl?: string
  currency?: string
  address?: string
}

export interface CategoryPayload {
  name: string
  icon?: string
  sortOrder?: number
}

export interface MenuItemPayload {
  categoryId: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  isAvailable?: boolean
  preparationTime?: number
  dietaryPreference?: 'veg' | 'non-veg' | 'vegan'
  originalPrice?: number
  discountPercent?: number
  weight?: string
  sortOrder?: number
}

class ApiClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getHeaders() {
    const token = useAuthStore.getState().accessToken ?? localStorage.getItem('accessToken')

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  private async request<T>(endpoint: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${endpoint.replace(/^\//, '')}`, {
      ...init,
      headers: {
        ...this.getHeaders(),
        ...init.headers,
      },
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const message = data?.message ?? data?.error ?? response.statusText ?? 'Something went wrong'
      throw new Error(Array.isArray(message) ? message[0] : message)
    }

    return data as T
  }

  protected get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  protected post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      body: JSON.stringify(body),
      method: 'POST',
    })
  }

  protected patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      body: JSON.stringify(body),
      method: 'PATCH',
    })
  }

  protected delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

class AuthApi extends ApiClient {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await this.post<{ message: string; success: boolean }>('auth/register', {
      email: payload.email,
      name: payload.fullName,
      password: payload.password,
    })

    return this.login({ email: payload.email, password: payload.password })
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await this.post<BackendAuthResponse>('auth/login', payload)

    return toAuthResponse(response, {
      email: payload.email,
      fullName: response.user?.name ?? response.user?.fullName ?? 'Menvo Owner',
    })
  }

  logout() {
    localStorage.removeItem('accessToken')
    removeCookie('accessToken')
  }
}

// Intentional misspelling: all restaurant routes use "restraunt" to match the
// backend NestJS controller path. Do not correct it without migrating the backend.
class RestaurantApi extends ApiClient {
  register(payload: RestaurantRegisterPayload) {
    return this.post<Restaurant>('restraunt/register', payload)
  }

  greet() {
    return this.get<string>('restraunt/restaurant-greet')
  }

  list() {
    return this.get<any[]>('restraunt/restaurants')
  }

  getBySlug(slug: string) {
    return this.get<any>(`restraunt/by-slug/${slug}`)
  }

  update(id: string, payload: UpdateRestaurantPayload) {
    return this.patch<any>(`restraunt/${id}`, payload)
  }

  remove(id: string) {
    return this.delete<{ message: string }>(`restraunt/${id}`)
  }

  scanTableQr(slug: string, tableId: string) {
    // This assumes the backend has this endpoint to track QR scans.
    // If not, it will just fail gracefully or we can mock it for now.
    return this.post<any>(`restraunt/${slug}/scan`, { tableId })
  }
}

class CategoryApi extends ApiClient {
  greet(slug: string) {
    return this.get(`${slug}/category/greet`)
  }

  create(slug: string, payload: CategoryPayload) {
    return this.post<Category>(`${slug}/category/create`, payload)
  }

  update(slug: string, id: string, payload: Partial<CategoryPayload>) {
    return this.patch<Category>(`${slug}/category/update/${id}`, payload)
  }

  list(slug: string) {
    return this.get<Category[]>(`${slug}/category/categories`)
  }

  remove(slug: string, id: string) {
    return super.delete(`${slug}/category/delete/${id}`)
  }
}

class MenuApi extends ApiClient {
  create(payload: MenuItemPayload) {
    return this.post('menu/create', payload)
  }

  deleteItem(id: string) {
    return this.delete(`menu/delete/${id}`)
  }

  updateItem(id: string, payload: Partial<MenuItemPayload>) {
    return this.patch(`menu/update/${id}`, payload)
  }

  getByCategory(categoryId: string) {
    return this.get<MenuItem[]>(`menu/${categoryId}/items`)
  }
}

function normalizeItem(item: any): MenuItem {
  return {
    id: String(item.id),
    name: item.name ?? '',
    description: item.description ?? '',
    price: Number(item.price),
    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
    weight: item.weight,
    imageUrl: item.imageUrl,
    isAvailable: item.isAvailable ?? true,
    preparationTime: item.preparationTime,
    dietaryPreference: item.dietaryPreference,
    deliveryMinutes: item.deliveryMinutes,
    discountPercent: item.discountPercent,
  }
}

function toAuthResponse(
  response: BackendAuthResponse,
  fallbackUser: Pick<AuthUser, 'email' | 'fullName'>,
): AuthResponse {
  localStorage.setItem('accessToken', response.accessToken)
  setCookie('accessToken', response.accessToken, 7)

  return {
    accessToken: response.accessToken,
    user: {
      email: response.user?.email ?? fallbackUser.email,
      fullName: response.user?.fullName ?? response.user?.name ?? fallbackUser.fullName,
      id: response.user?.id ?? fallbackUser.email,
    },
  }
}

function setCookie(name: string, value: string, expiresInDays: number) {
  const expires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toUTCString()
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax${secure}`
}

function removeCookie(name: string) {
  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`
}

export const authApi = new AuthApi(BASE_URL)
export const restaurantApi = new RestaurantApi(BASE_URL)
export const categoryApi = new CategoryApi(BASE_URL)
export const menuApi = new MenuApi(BASE_URL)

export function registerOwner(payload: RegisterPayload) {
  return authApi.register(payload)
}

export function loginOwner(payload: LoginPayload) {
  return authApi.login(payload)
}

export async function getRestaurantMenu(slug: string): Promise<RestaurantMenu> {
  try {
    const restaurant = await restaurantApi.getBySlug(slug)
    return {
      slug,
      restaurantName: restaurant.name ?? slug,
      address: restaurant.address || restaurant.bio || '',
      logoUrl: restaurant.logoUrl || undefined,
      currency: restaurant.currency || 'USD',
      categories: (restaurant.categories ?? []).map((category: any) => ({
        ...category,
        id: String(category.id),
        icon: category.icon || undefined,
        name: String(category.name ?? ''),
        items: (category.items ?? []).map(normalizeItem),
      })),
    }
  } catch {
    const categories = await categoryApi.list(slug)
    return {
      categories: categories.map((category) => ({
        ...category,
        id: String(category.id),
        items: (category.items ?? []).map(normalizeItem),
        name: String(category.name),
      })),
      restaurantName: slug,
      slug,
    }
  }
}
