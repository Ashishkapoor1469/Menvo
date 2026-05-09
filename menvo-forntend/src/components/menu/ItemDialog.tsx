import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import type { MenuItem } from '../../types/menu'
import { Badge } from '../ui/Badge'
import { DietaryBadge } from './ItemCard'
import './ItemDialog.css'

interface ItemDialogProps {
  item: MenuItem
  currency?: string
  conversionRate?: number
  onClose: () => void
}

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', INR: '₹', EUR: '€' }

export function ItemDialog({ item, currency = 'USD', conversionRate = 1, onClose }: ItemDialogProps) {
  const sym = CURRENCY_SYMBOLS[currency] || currency
  const price = (item.price * conversionRate).toFixed(2)
  const origPrice = item.originalPrice ? (item.originalPrice * conversionRate).toFixed(2) : null
  const savings = item.originalPrice ? ((item.originalPrice - item.price) * conversionRate).toFixed(2) : null
  const minutes = item.preparationTime ?? item.deliveryMinutes ?? 18

  return (
    <>
      <motion.div
        animate={{ opacity: 0.55 }}
        className="item-dialog__overlay"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
        transition={{ duration: 0.25 }}
      />
      <motion.section
        aria-modal="true"
        className="item-dialog"
        exit={{ y: '100%' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        role="dialog"
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="item-dialog__handle" />
        {item.imageUrl ? (
          <img className="item-dialog__image" src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="item-dialog__image item-dialog__image--empty" />
        )}

        <div className="item-dialog__heading">
          {item.discountPercent ? <Badge>{item.discountPercent}% OFF</Badge> : null}
          <div className="item-dialog__title-row">
            <h2>{item.name}</h2>
            {item.dietaryPreference ? <DietaryBadge preference={item.dietaryPreference} /> : null}
          </div>
        </div>

        <p className="item-dialog__weight">{item.weight ?? 'Single serving'}</p>
        {!item.isAvailable && <p className="item-dialog__unavailable">Currently unavailable</p>}

        <div className="item-dialog__price">
          <strong>{sym}{price}</strong>
          {origPrice ? <span>{sym}{origPrice}</span> : null}
          {savings && Number(savings) > 0 ? <em>Save {sym}{savings}</em> : null}
        </div>

        {item.description && (
          <>
            <hr />
            <h3>About this item</h3>
            <p className="item-dialog__description">{item.description}</p>
          </>
        )}

        <hr />
        <p className="item-dialog__delivery">
          <Clock size={12} />
          Usually prepared in {minutes} min
        </p>
      </motion.section>
    </>
  )
}
