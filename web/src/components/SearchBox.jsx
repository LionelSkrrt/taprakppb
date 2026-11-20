import { Search, X } from 'lucide-react'

export default function SearchBox({ value, onChange, placeholder, label }) {
  return (
    <div className="searchbox">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Hapus pencarian">
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
