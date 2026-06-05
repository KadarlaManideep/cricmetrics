import React from 'react'

type Props = {
  label: string
  value: string | number
  small?: string
  color?: 'purple' | 'teal' | 'amber' | 'coral'
}

const accentColors = {
  purple: '#2563EB',
  teal:   '#10B981',
  amber:  '#F59E0B',
  coral:  '#EF4444',
}

const StatCard: React.FC<Props> = ({ label, value, small, color = 'purple' }) => {
  const accent = accentColors[color]
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${accent}` }}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {small && <div className="small">{small}</div>}
    </div>
  )
}

export default StatCard
