import './Button.css'

export default function Button({ children, type = 'button', onClick, className = '' }) {
  return (
    <button type={type} onClick={onClick} className={`ui-button ${className}`}>
      {children}
    </button>
  )
}
