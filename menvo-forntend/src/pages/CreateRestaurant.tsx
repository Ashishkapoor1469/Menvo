import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { restaurantApi } from '../services/api'
import './CreateRestaurant.css'

export function CreateRestaurant() {
  const [restaurantName, setRestaurantName] = useState('')
  const [restaurantBio, setRestaurantBio] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!restaurantName.trim()) {
      setError('Restaurant name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const restaurant = await restaurantApi.register({
        restaurantName: restaurantName.trim(),
        restaurantBio: restaurantBio.trim() || undefined,
      })
      const slug = (restaurant as any).slug
      // Success! Navigate to dashboard
      navigate('/dashboard', { state: { restaurantSlug: slug } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create restaurant')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="create-restaurant">
      {/* Decorative background elements */}
      <div className="create-restaurant__bg-pattern" aria-hidden="true">
        <div className="create-restaurant__bg-circle create-restaurant__bg-circle--1" />
        <div className="create-restaurant__bg-circle create-restaurant__bg-circle--2" />
        <div className="create-restaurant__bg-circle create-restaurant__bg-circle--3" />
      </div>

      <div className="create-restaurant__card">
        <header className="create-restaurant__header">
          <div className="create-restaurant__logo-wrapper">
            <img
              className="create-restaurant__logo"
              src="/menvoLogo.jpg"
              alt="Menvo"
            />
          </div>
          <h1>Welcome to Menvo!</h1>
          <p className="create-restaurant__tagline">
            Your digital menu, one scan away
          </p>
        </header>

        <form className="create-restaurant__form" onSubmit={handleSubmit}>
          {error && <div className="create-restaurant__error">{error}</div>}

          <div className="create-restaurant__field">
            <label className="create-restaurant__label" htmlFor="restaurantName">
              Restaurant Name
            </label>
            <Input
              id="restaurantName"
              placeholder="e.g. Joe's Diner"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              required
              autoComplete="organization"
            />
          </div>

          <div className="create-restaurant__field">
            <label className="create-restaurant__label" htmlFor="restaurantBio">
              Description <span className="create-restaurant__optional">(Optional)</span>
            </label>
            <Input
              id="restaurantBio"
              placeholder="Tell customers about your place..."
              value={restaurantBio}
              onChange={(e) => setRestaurantBio(e.target.value)}
            />
          </div>

          <Button type="submit" isLoading={isSubmitting} style={{ width: '100%' }}>
            🚀 Create Restaurant
          </Button>
        </form>

        <p className="create-restaurant__step">Step 1 of 1</p>
      </div>
    </main>
  )
}
