import { X } from 'lucide-react'
import type { Restaurant, Table } from '../../types/menu'
import './RestaurantDialog.css'

interface RestaurantDialogProps {
  restaurant: Restaurant
  tables: Table[]
  onClose: () => void
}

const defaultTables: Table[] = [
  { id: 'A1', seats: 2, status: 'empty', label: 'No customer' },
  { id: 'A2', seats: 4, status: 'scanned', label: 'QR scanned' },
  { id: 'A3', seats: 4, status: 'ordered', label: 'Order placed' },
  { id: 'B1', seats: 2, status: 'empty', label: 'No customer' },
  { id: 'B2', seats: 6, status: 'ordered', label: 'Order placed' },
  { id: 'B3', seats: 4, status: 'scanned', label: 'QR scanned' },
  { id: 'C1', seats: 2, status: 'empty', label: 'No customer' },
  { id: 'C2', seats: 8, status: 'empty', label: 'No customer' },
]

export function RestaurantDialog({ restaurant, tables: _tables, onClose }: RestaurantDialogProps) {
  const tables = _tables.length > 0 ? _tables : defaultTables
  const occupied = tables.filter((t) => t.status !== 'empty').length
  const orders = tables.filter((t) => t.status === 'ordered').length
  const scanned = tables.filter((t) => t.status === 'scanned').length

  return (
    <div className="rdialog-overlay" onClick={onClose}>
      <div className="rdialog" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="rdialog__close" onClick={onClose} type="button" aria-label="Close">
          <X size={20} />
        </button>

        {/* Header */}
        <header className="rdialog__header">
          <div className="rdialog__icon">🍽️</div>
          <h2 className="rdialog__title">{restaurant.name}</h2>
          {restaurant.bio && <p className="rdialog__bio">{restaurant.bio}</p>}
        </header>

        {/* Stats */}
        <div className="rdialog__stats">
          <div className="rdialog__stat">
            <strong>{tables.length}</strong>
            <span>Tables</span>
          </div>
          <div className="rdialog__stat">
            <strong>{occupied}</strong>
            <span>Occupied</span>
          </div>
          <div className="rdialog__stat">
            <strong>{scanned}</strong>
            <span>Scanned</span>
          </div>
          <div className="rdialog__stat">
            <strong>{orders}</strong>
            <span>Orders</span>
          </div>
        </div>

        {/* Tables */}
        <section className="rdialog__section">
          <div className="rdialog__section-head">
            <h3>Tables</h3>
            <div className="rdialog__legend">
              <span><i className="rdialog__dot rdialog__dot--empty" /> Empty</span>
              <span><i className="rdialog__dot rdialog__dot--scanned" /> QR Scanned</span>
              <span><i className="rdialog__dot rdialog__dot--ordered" /> Order Placed</span>
            </div>
          </div>
          <div className="rdialog__table-grid">
            {tables.map((table) => (
              <div className={`rdialog__table rdialog__table--${table.status}`} key={table.id}>
                <strong>{table.id}</strong>
                <span>{table.seats} seats</span>
                <em>{table.label}</em>
              </div>
            ))}
          </div>
        </section>


        {/* Categories / Menu */}
        {restaurant.categories && restaurant.categories.length > 0 && (
          <section className="rdialog__section">
            <div className="rdialog__section-head">
              <h3>Menu Items</h3>
            </div>
            <div className="rdialog__categories">
              {restaurant.categories.map((cat) => (
                <div className="rdialog__category" key={cat.id}>
                  <h4>{cat.name || `Category #${cat.id}`}</h4>
                  {cat.items && cat.items.length > 0 ? (
                    <ul className="rdialog__items">
                      {cat.items.map((item) => (
                        <li key={item.id}>
                          <span>{item.name}</span>
                          <span className="rdialog__price">
                            {((restaurant as any).currency === 'INR' ? '₹' : (restaurant as any).currency === 'EUR' ? '€' : '$')}{Number(item.price).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rdialog__no-items">No items</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
