import type { ReactNode } from 'react'
import { Logo } from '../ui/Logo'
import './AuthCard.css'

interface AuthCardProps {
  children: ReactNode
  shake?: boolean
}

export function AuthCard({ children, shake = false }: AuthCardProps) {
  return (
    <section className={`auth-card${shake ? ' auth-card--shake' : ''}`}>
      <Logo />
      <h1 className="auth-card__title">The smartest menu your restaurant ever had.</h1>
      <p className="auth-card__subtitle">Your menu. Your QR. Your brand.</p>
      {children}
    </section>
  )
}
