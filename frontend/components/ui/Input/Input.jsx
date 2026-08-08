import './Input.css'

export default function Input({ label, value, onChange, placeholder = '', type = 'text', className = '' }) {
  return (
    <label className={`ui-input ${className}`}>
      {label && <span className="ui-input__label">{label}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="ui-input__field"
      />
    </label>
  )
}
