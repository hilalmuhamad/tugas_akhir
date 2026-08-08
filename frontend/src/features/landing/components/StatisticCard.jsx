export default function StatisticCard({ value, label }) {
  return (
    <div className="statistic-card">
      <p className="statistic-card__value">{value}</p>
      <p className="statistic-card__label">{label}</p>
    </div>
  )
}
