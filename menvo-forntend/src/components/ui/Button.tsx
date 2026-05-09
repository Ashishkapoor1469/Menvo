import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  isLoading?: boolean
  variant?: 'primary' | 'ghost' | 'danger'
}

export function Button({ children, isLoading = false, variant = 'primary', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`button button--${variant}`}
      disabled={disabled || isLoading}
      type="button"
      {...props}
    >
      {isLoading ? <Loader2 aria-hidden className="button__spinner" size={18} /> : null}
      {children}
    </button>
  )
}
