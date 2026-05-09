import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'
import { Input } from './Input'
import './PasswordInput.css'

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function PasswordInput({ error, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <Input {...props} type={visible ? 'text' : 'password'} error={error} />
      <button
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="password-field__toggle"
        disabled={props.disabled}
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
