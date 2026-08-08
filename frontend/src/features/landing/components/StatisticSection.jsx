import { useEffect, useState } from 'react'
import StatisticCard from './StatisticCard.jsx'

export default function StatisticSection() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/stats')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const cards = stats
    ? [
        { value: `${stats.total_alumni}+`, label: 'Alumni Terdata' },
        { value: `${stats.total_lowongan}+`, label: 'Lowongan Aktif' },
        { value: `${stats.jumlah_prodi}+`, label: 'Program Studi' },
      ]
    : [
        { value: '-', label: 'Alumni Terdata' },
        { value: '-', label: 'Lowongan Aktif' },
        { value: '-', label: 'Program Studi' },
      ]

  return (
    <section id="statistics" className="landing-statistic-section">
      <div className="section-header">
        <p className="eyebrow">Tracer Study ULBI</p>
        <h2>Data lulusan yang sudah terindeks</h2>
      </div>
      <div className="statistic-grid">
        {cards.map((stat) => (
          <StatisticCard key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </section>
  )
}