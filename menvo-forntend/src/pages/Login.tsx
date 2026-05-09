import { useState } from 'react'
import { AuthCard } from '../components/auth/AuthCard'
import { LoginForm } from '../components/auth/LoginForm'
import { MobileShell } from '../components/layout/MobileShell'

export function Login() {
  const [shake, setShake] = useState(false)

  function triggerShake() {
    setShake(false)
    window.setTimeout(() => setShake(true), 0)
    window.setTimeout(() => setShake(false), 320)
  }

  return (
    <MobileShell>
      <AuthCard shake={shake}>
        <LoginForm onInvalid={triggerShake} />
      </AuthCard>
    </MobileShell>
  )
}
