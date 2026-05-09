import type { MenuItem } from '../../types/menu'
import { SkeletonCard } from '../ui/SkeletonCard'
import { ItemCard } from './ItemCard'
import './ItemsGrid.css'

interface ItemsGridProps {
  items?: MenuItem[]
  isLoading?: boolean
  currency?: string
  conversionRate?: number
  onItemClick?: (item: MenuItem) => void
}

export function ItemsGrid({ items = [], isLoading = false, currency = 'USD', conversionRate = 1, onItemClick }: ItemsGridProps) {
  const skeletons = Array.from({ length: 8 }, (_, index) => index)

  return (
    <div className="items-grid">
      {isLoading
        ? skeletons.map((item) => <SkeletonCard key={item} />)
        : items.map((item) => (
            <ItemCard
              item={item}
              key={item.id}
              currency={currency}
              conversionRate={conversionRate}
              onItemClick={onItemClick ?? (() => undefined)}
            />
          ))}
    </div>
  )
}
