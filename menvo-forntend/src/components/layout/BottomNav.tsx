import { LayoutGrid, QrCode, Settings, UtensilsCrossed } from 'lucide-react'
import './BottomNav.css'

const tabs = [
  { id: 'menu', label: 'Menu', Icon: UtensilsCrossed },
  { id: 'categories', label: 'Categories', Icon: LayoutGrid },
  { id: 'qr', label: 'QR Code', Icon: QrCode },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Dashboard tabs">
      {tabs.map(({ id, label, Icon }) => (
        <button
          className={`bottom-nav__item${activeTab === id ? ' bottom-nav__item--active' : ''}`}
          key={id}
          onClick={() => onTabChange(id)}
          type="button"
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
