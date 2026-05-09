import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { loginOwner } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { loginSchema, type LoginFormValues } from '../../utils/validation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { PasswordInput } from '../ui/PasswordInput'
import './AuthForm.css'

interface LoginFormProps {
  onInvalid: () => void
}

export function LoginForm({ onInvalid }: LoginFormProps) {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [formError, setFormError] = useState('')
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const submit = handleSubmit(
    async (payload) => {
      setFormError('')
      try {
        const response = await loginOwner(payload)
        setAuth(response.accessToken, response.user)
        navigate('/dashboard')
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Unable to sign in')
      }
    },
    () => onInvalid(),
  )

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <Input
        disabled={isSubmitting}
        error={errors.email?.message}
        id="loginEmail"
        placeholder="Email address"
        type="email"
        {...register('email')}
      />
      <PasswordInput
        disabled={isSubmitting}
        error={errors.password?.message}
        id="loginPassword"
        placeholder="Password"
        {...register('password')}
      />
      <a className="auth-form__forgot" href="mailto:support@menvo.app">
        Forgot password?
      </a>
      {formError ? <p className="auth-form__error">{formError}</p> : null}
      <Button isLoading={isSubmitting} type="submit">
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
      <p className="auth-form__footer">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  )
}
