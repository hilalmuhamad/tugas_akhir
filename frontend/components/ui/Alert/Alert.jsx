export default function Alert({ message, type = 'info', className = '' }) {
  return (
    <div className={`ui-alert ui-alert--${type} ${className}`}>
      {message}
    </div>
  )
}
