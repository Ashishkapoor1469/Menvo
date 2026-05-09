import type { FormEvent } from 'react'
import type { Category } from '../../types/menu'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import './CategoryDetailPanel.css'

interface CategoryDetailPanelProps {
  category: Category
  menuItemName: string
  menuItemPrice: string
  isSaving: boolean
  onMenuItemNameChange: (value: string) => void
  onMenuItemPriceChange: (value: string) => void
  onSubmitMenuItem: (event: FormEvent<HTMLFormElement>) => void
}

export function CategoryDetailPanel({
  category,
  menuItemName,
  menuItemPrice,
  isSaving,
  onMenuItemNameChange,
  onMenuItemPriceChange,
  onSubmitMenuItem,
}: CategoryDetailPanelProps) {
  return (
    <div className="cat-detail">
      <div className="cat-detail__head">
        <span className="cat-detail__icon">📁</span>
        <h3 className="cat-detail__title">{category.name}</h3>
        <span className="cat-detail__badge">{category.items?.length ?? 0} items</span>
      </div>

      {/* Items list */}
      {category.items && category.items.length > 0 ? (
        <ul className="cat-detail__items">
          {category.items.map((item: any) => (
            <li key={item.id} className="cat-detail__item">
              <div className="cat-detail__item-info">
                <span className="cat-detail__item-name">{item.name}</span>
                {item.description && (
                  <span className="cat-detail__item-desc">{item.description}</span>
                )}
              </div>
              <span className="cat-detail__item-price">${Number(item.price).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="cat-detail__empty">No items added yet. Add your first item below!</p>
      )}

      {/* Add item form */}
      <form className="cat-detail__form" onSubmit={onSubmitMenuItem}>
        <h4 className="cat-detail__form-title">+ Add Item</h4>
        <div className="cat-detail__form-row">
          <Input
            placeholder="Item name"
            value={menuItemName}
            onChange={(e) => onMenuItemNameChange(e.target.value)}
            required
          />
          <Input
            placeholder="Price"
            type="number"
            step="0.01"
            value={menuItemPrice}
            onChange={(e) => onMenuItemPriceChange(e.target.value)}
            required
          />
        </div>
        <Button isLoading={isSaving} type="submit">
          Add Item
        </Button>
      </form>
    </div>
  )
}
