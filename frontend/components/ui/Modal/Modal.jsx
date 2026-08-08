export default function Modal({ title, children, open, onClose }) {
  if (!open) return null

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div className="ui-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ui-modal__header">
          <h2>{title}</h2>
          <button className="ui-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  )
}
