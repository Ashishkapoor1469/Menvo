import { Clock, Info, Leaf } from 'lucide-react'
import type { MenuItem } from '../../types/menu'
import { Badge } from '../ui/Badge'
import './ItemCard.css'

interface ItemCardProps {
  item: MenuItem
  currency?: string
  conversionRate?: number
  onItemClick: (item: MenuItem) => void
}

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', INR: '₹', EUR: '€' }

export function ItemCard({ item, currency = 'USD', conversionRate = 1, onItemClick }: ItemCardProps) {
  const minutes = item.preparationTime ?? item.deliveryMinutes ?? 18
  const sym = CURRENCY_SYMBOLS[currency] || currency

  const price = (item.price * conversionRate).toFixed(2)
  const origPrice = item.originalPrice ? (item.originalPrice * conversionRate).toFixed(2) : null

  return (
    <article
      className={`item-card${item.isAvailable ? '' : ' item-card--unavailable'}`}
      onClick={() => onItemClick(item)}
    >
      {item.discountPercent ? <Badge>{item.discountPercent}% OFF</Badge> : null}

      <div className="item-card__image">
        {item.imageUrl ? <img alt={item.name} src={item.imageUrl} loading="lazy" /> : null}
        {item.dietaryPreference ? <DietaryBadge preference={item.dietaryPreference} /> : null}
        {!item.isAvailable && <span className="item-card__unavailable-overlay">Currently unavailable</span>}
      </div>

      <div className="item-card__time">
        <Clock size={9} />
        <span>{minutes} MINS</span>
        {item.dietaryPreference && (
          <span className={`item-card__diet item-card__diet--${item.dietaryPreference}`}>
            {item.dietaryPreference === 'veg' ? '● VEG' : item.dietaryPreference === 'vegan' ? '● VEGAN' : '● NON-VEG'}
          </span>
        )}
      </div>

      <h3>{item.name}</h3>

      {item.description && (
        <p className="item-card__desc">{item.description}</p>
      )}

      <p className="item-card__weight">{item.weight ?? 'Single serving'}</p>

      <div className="item-card__price-row">
        <div>
          <strong>{sym}{price}</strong>
          {origPrice ? <span>{sym}{origPrice}</span> : null}
        </div>
        <button
          aria-label={`More about ${item.name}`}
          className="item-card__info"
          onClick={(event) => {
            event.stopPropagation()
            onItemClick(item)
          }}
          type="button"
        >
          <Info size={13} />
        </button>
      </div>
    </article>
  )
}

export function DietaryBadge({ preference }: { preference: NonNullable<MenuItem['dietaryPreference']> }) {
  return (
    <span className={`dietary-badge dietary-badge--${preference}`} aria-label={preference}>
      {preference === 'vegan' ? <Leaf size={8} /> : <i />}
    </span>
  )
}
