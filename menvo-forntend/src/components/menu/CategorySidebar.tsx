import type { Category } from '../../types/menu'
import './CategorySidebar.css'

interface CategorySidebarProps {
  activeId: string
  categories: Category[]
  onSelect: (id: string) => void
}

export function CategorySidebar({ activeId, categories, onSelect }: CategorySidebarProps) {
  return (
    <aside className="category-sidebar" aria-label="Menu categories">
      {categories.map((category) => (
        <button
          className={`cat-item${activeId === category.id ? ' cat-item--active' : ''}`}
          key={category.id}
          onClick={() => onSelect(category.id)}
          type="button"
        >
          <span className="cat-item__thumb">
            {category.thumbnailUrl ? (
              <img alt="" src={category.thumbnailUrl} loading="lazy" />
            ) : (
              <span>{category.icon ?? category.emoji ?? '🍽️'}</span>
            )}
          </span>
          <span className="cat-item__label">{category.name}</span>
        </button>
      ))}
    </aside>
  )
}

