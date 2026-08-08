export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="ui-loading">
      <div className="ui-loading__spinner" />
      <span>{message}</span>
    </div>
  )
}
