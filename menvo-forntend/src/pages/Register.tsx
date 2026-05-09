import { useState } from 'react'
import { AuthCard } from '../components/auth/AuthCard'
import { RegisterForm } from '../components/auth/RegisterForm'
import { MobileShell } from '../components/layout/MobileShell'

export function Register() {
  const [shake, setShake] = useState(false)

  function triggerShake() {
    setShake(false)
    window.setTimeout(() => setShake(true), 0)
    window.setTimeout(() => setShake(false), 320)
  }

  return (
    <MobileShell>
      <AuthCard shake={shake}>
        <RegisterForm onInvalid={triggerShake} />
      </AuthCard>
    </MobileShell>
  )
}
