import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, TrendingUp, Zap, Users, Calendar, Swords, Trophy, BarChart2 } from 'lucide-react'

const topItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/batting', icon: TrendingUp, label: 'Batting' },
  { to: '/bowling', icon: Zap, label: 'Bowling' },
  { to: '/teams', icon: Users, label: 'Teams' },
  { to: '/matches', icon: Calendar, label: 'Matches' },
]

const bottomItems = [
  { to: '/h2h', icon: Swords, label: 'Head to Head' },
  { to: '/records', icon: Trophy, label: 'Records' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
]

const SidebarLink: React.FC<{ to: string; icon: React.ElementType; label: string; end?: boolean }> = ({
  to, icon: Icon, label, end,
}) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      isActive ? 'sidebar-item sidebar-item--active' : 'sidebar-item'
    }
    style={{ textDecoration: 'none' }}
  >
    <Icon size={18} style={{ flexShrink: 0 }} />
    <span>{label}</span>
  </NavLink>
)

const Sidebar: React.FC = () => (
  <aside style={{
    position: 'fixed',
    left: 0,
    top: 56,
    width: 220,
    height: 'calc(100vh - 56px)',
    background: '#1e4080',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 16,
    paddingBottom: 16,
  }}>
    <nav style={{ flex: 1 }}>
      {topItems.map(item => (
        <SidebarLink key={item.to} {...item} />
      ))}

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        margin: '8px 16px',
      }} />

      {bottomItems.map(item => (
        <SidebarLink key={item.to} {...item} />
      ))}
    </nav>

    <div style={{
      padding: '16px 20px',
      color: 'rgba(255,255,255,0.25)',
      fontSize: 11,
    }}>
      IPL 2008–2025
    </div>
  </aside>
)

export default Sidebar
