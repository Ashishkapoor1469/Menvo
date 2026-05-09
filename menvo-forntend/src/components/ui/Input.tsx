import type { InputHTMLAttributes } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ error, id, ...props }: InputProps) {
  return (
    <div className="field">
      <input
        id={id}
        className={`field__input${error ? ' field__input--error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error && id ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <p className="field__error" id={id ? `${id}-error` : undefined}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
