import { useEffect, useMemo, useState } from 'react'
import { sampleMenu } from '../sample/menu'
import { getRestaurantMenu } from '../services/api'
import type { RestaurantMenu } from '../types/menu'

export function useMenu(slug = 'demo', options: { sample?: boolean } = {}) {
  const [data, setData] = useState<RestaurantMenu | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const mockData = useMemo(() => ({ ...sampleMenu, slug }), [slug])

  useEffect(() => {
    let mounted = true

    if (options.sample) {
      return () => {
        mounted = false
      }
    }

    getRestaurantMenu(slug)
      .then((menu) => {
        if (mounted) setData(menu)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Menu could not be loaded')
        setData(null)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [options.sample, slug])

  if (options.sample) {
    return { data: mockData, error: '', isLoading: false }
  }

  return { data, error, isLoading }
}
