import type { ReactNode } from 'react'
import './MobileShell.css'

interface MobileShellProps {
  children: ReactNode
  variant?: 'gold' | 'surface'
}

export function MobileShell({ children, variant = 'gold' }: MobileShellProps) {
  return <div className={`mobile-shell mobile-shell--${variant}`}>{children}</div>
}
