import FeatureCard from './FeatureCard.jsx'

const features = [
  { title: 'Fast Setup', description: 'Get started quickly with minimal configuration.' },
  { title: 'Reusable UI', description: 'Build consistent interfaces using composable components.' },
  { title: 'Responsive Design', description: 'Works beautifully on mobile, tablet, and desktop.' },
]

export default function FeatureSection() {
  return (
    <section id="features" className="landing-feature-section">
      <div className="section-header">
        <p className="eyebrow">Features</p>
        <h2>Everything you need to ship faster</h2>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
        ))}
      </div>
    </section>
  )
}
