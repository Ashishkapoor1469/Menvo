import { Search } from 'lucide-react'
import './SearchBar.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="menu-search">
      <Search size={15} />
      <span className="sr-only">Search menu items</span>
      <input
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search menu items..."
        type="search"
        value={value}
      />
    </label>
  )
}
