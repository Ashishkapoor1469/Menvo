import type { Category } from '../../types/menu'
import './CategoryChips.css'

interface CategoryChipsProps {
  categories: Category[]
  activeCategoryId: string | null
  onSelect: (id: string) => void
}

export function CategoryChips({ categories, activeCategoryId, onSelect }: CategoryChipsProps) {
  if (categories.length === 0) return null

  return (
    <div className="cat-chips">
      <div className="cat-chips__scroll">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`cat-chips__chip${activeCategoryId === String(cat.id) ? ' cat-chips__chip--active' : ''}`}
            onClick={() => onSelect(String(cat.id))}
            type="button"
          >
            {(cat.icon || cat.emoji) && <span className="cat-chips__emoji">{cat.icon || cat.emoji}</span>}
            <span>{cat.name}</span>
            <span className="cat-chips__count">{cat.items?.length ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
