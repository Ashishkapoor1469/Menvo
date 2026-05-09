import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { registerOwner } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { registerSchema, type RegisterFormValues } from '../../utils/validation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { PasswordInput } from '../ui/PasswordInput'
import './AuthForm.css'

interface RegisterFormProps {
  onInvalid: () => void
}

export function RegisterForm({ onInvalid }: RegisterFormProps) {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [formError, setFormError] = useState('')
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const submit = handleSubmit(
    async ({ fullName, email, password }) => {
      setFormError('')
      try {
        const response = await registerOwner({ fullName, email, password })
        setAuth(response.accessToken, response.user)
        navigate('/create-restaurant')
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Unable to create account')
      }
    },
    () => onInvalid(),
  )

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <Input
        disabled={isSubmitting}
        error={errors.fullName?.message}
        id="fullName"
        placeholder="Full name"
        {...register('fullName')}
      />
      <Input
        disabled={isSubmitting}
        error={errors.email?.message}
        id="email"
        placeholder="Email address"
        type="email"
        {...register('email')}
      />
      <PasswordInput
        disabled={isSubmitting}
        error={errors.password?.message}
        id="password"
        placeholder="Password"
        {...register('password')}
      />
      <PasswordInput
        disabled={isSubmitting}
        error={errors.confirmPassword?.message}
        id="confirmPassword"
        placeholder="Confirm password"
        {...register('confirmPassword')}
      />
      {formError ? <p className="auth-form__error">{formError}</p> : null}
      <Button isLoading={isSubmitting} type="submit">
        {isSubmitting ? 'Creating account...' : 'Register'}
      </Button>
      <p className="auth-form__footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  )
}
