import type { Restaurant } from '../../types/menu'
import './RestaurantCard.css'

interface RestaurantCardProps {
  restaurant: Restaurant
  onClick: () => void
  index?: number
  showMenuLink?: boolean
}

export function RestaurantCard({ restaurant, onClick, index = 0, showMenuLink = false }: RestaurantCardProps) {
  const categoryCount = restaurant.categories?.length ?? 0
  const itemCount = restaurant.categories?.reduce((sum, c) => sum + (c.items?.length ?? 0), 0) ?? 0

  return (
    <article
      className="restaurant-card"
      onClick={onClick}
      style={{ animationDelay: `${index * 80}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="restaurant-card__accent" />
      <div className="restaurant-card__content">
        <div className="restaurant-card__icon">🍽️</div>
        <div className="restaurant-card__info">
          <h3 className="restaurant-card__name">{restaurant.name}</h3>
          {restaurant.bio && (
            <p className="restaurant-card__bio">{restaurant.bio}</p>
          )}
          <div className="restaurant-card__meta">
            <span>📦 {categoryCount} Categories</span>
            <span className="restaurant-card__dot">·</span>
            <span>{itemCount} Items</span>
          </div>
        </div>
        <div className="restaurant-card__arrow">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {showMenuLink && (
        <div className="restaurant-card__actions" style={{ padding: '0 16px 16px', marginTop: '-4px' }}>
          <a 
            href={`/m/${restaurant.slug}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="dashboard__menu-link" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            View Public Menu Page
          </a>
        </div>
      )}
    </article>
  )
}
