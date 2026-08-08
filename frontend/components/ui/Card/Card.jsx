export default function Card({ title, children, className = '' }) {
  return (
    <div className={`ui-card ${className}`}>
      {title && <div className="ui-card__header">{title}</div>}
      <div className="ui-card__body">{children}</div>
    </div>
  )
}
