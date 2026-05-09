import { ChevronDown } from 'lucide-react'
import type { RestaurantMenu } from '../../types/menu'
import './MenuHeader.css'

interface MenuHeaderProps {
  menu: RestaurantMenu
  tableId?: string
  currency?: string
  onCurrencyChange?: (currency: string) => void
}

export function MenuHeader({ menu, tableId, currency = 'INR', onCurrencyChange }: MenuHeaderProps) {
  return (
    <header className="menu-header">
      <div className="menu-header__top">
        {menu.logoUrl ? (
          <img
            src={menu.logoUrl}
            alt={`${menu.restaurantName} logo`}
            className="menu-header__logo"
          />
        ) : (
          <span className="menu-header__spacer" aria-hidden="true" />
        )}
        <div className="menu-header__title">
          <h1>{menu.restaurantName}</h1>
          <p>
            {tableId ? `Table ${tableId}` : menu.address ?? 'Digital menu'}{' '}
            <ChevronDown size={10} />
          </p>
        </div>
        <div className="menu-header__actions">
          {onCurrencyChange && (
            <select
              className="menu-header__currency"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
            >
              <option value="USD">$</option>
              <option value="INR">₹</option>
              <option value="EUR">€</option>
            </select>
          )}
        </div>
      </div>
      <div className="menu-header__brand">
        {menu.logoUrl ? (
          <img
            src={menu.logoUrl}
            alt={`${menu.restaurantName} logo`}
            className="menu-header__brand-logo"
          />
        ) : (
          <span className="menu-header__mark">M</span>
        )}
        <span>
          {tableId
            ? `QR menu for Table ${tableId}`
            : `${menu.restaurantName} on Menvo`}
        </span>
      </div>
    </header>
  )
}
