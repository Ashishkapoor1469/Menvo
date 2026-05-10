import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { PublicMenu } from './pages/PublicMenu'
import { Register } from './pages/Register'
import { CreateRestaurant } from './pages/CreateRestaurant'
import { CategoryItems } from './pages/CategoryItems'
import { restaurantApi } from './services/api'
import { useAuthStore } from './store/authStore'
import { useRestaurantStore } from './store/restaurantStore'

function ProtectedRoute() {
  const location = useLocation()
  const token = useAuthStore((state) => state.accessToken)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [validatedToken, setValidatedToken] = useState<string | null>(null)

  const setRestaurants = useRestaurantStore((s) => s.setRestaurants)

  useEffect(() => {
    if (!token) return
    let mounted = true

    restaurantApi
      .greet()
      .then(() => {
        if (mounted) setValidatedToken(token)
        // Bug 2 fix: pre-fetch restaurants on token validation so data
        // persists across page refreshes
        return restaurantApi.list()
      })
      .then((data) => {
        if (!mounted || !data) return
        const mapped = (data || []).map((r: any) => ({
          id: String(r.id),
          name: r.name || r.restaurantName || 'Unnamed',
          slug: r.slug || '',
          bio: r.bio || r.restaurantBio || '',
          logoUrl: r.logoUrl || '',
          address: r.address || '',
          currency: r.currency || 'USD',
          categories: (r.categories || []).map((c: any) => ({
            ...c,
            name: String(c.name || c.categoryName || c.slug || ''),
            items: c.items ?? [],
          })),
        }))
        setRestaurants(mapped)
      })
      .catch(() => {
        clearAuth()
        if (mounted) setValidatedToken(null)
      })

    return () => {
      mounted = false
    }
  }, [clearAuth, token, setRestaurants])

  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (validatedToken !== token) return null
  return <Outlet />
}

function GuestRoute() {
  const token = useAuthStore((state) => state.accessToken)
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  
  if (token && isAuthPage) {
    // If they just registered, they will be navigated to /create-restaurant by the component.
    // So we don't redirect here immediately unless they are still on login.
    // But since the component handles navigation, let's just return Navigate for login, 
    // and let register navigate on its own. Actually, just returning null or Outlet 
    // lets the component's navigate take over.
    return <Navigate to={location.pathname === '/register' ? "/create-restaurant" : "/dashboard"} replace />
  }
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<GuestRoute />}>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>
      <Route path="/m/:slug" element={<PublicMenu />} />
      <Route path="/m/:slug/t/:tableId" element={<PublicMenu />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/create-restaurant" element={<CreateRestaurant />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/menu" replace />} />
        <Route path="/dashboard/:tab" element={<Dashboard />} />
        <Route path="/dashboard/categories/:id" element={<CategoryItems />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
