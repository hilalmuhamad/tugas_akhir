export default function Badge({ label, variant = 'default', className = '' }) {
  return (
    <span className={`ui-badge ui-badge--${variant} ${className}`}>
      {label}
    </span>
  )
}
