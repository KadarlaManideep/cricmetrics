import React from 'react'
import { Menu, Bell } from 'lucide-react'

const Navbar: React.FC = () => (
  <nav style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: 56,
    background: '#1a3a6b',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 1000,
  }}>
    {/* Left: hamburger + branding */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Menu size={20} color="rgba(255,255,255,0.6)" style={{ cursor: 'default', flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: '#2563EB',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" fill="white" />
            <path d="M3 12 C7 8, 17 8, 21 12" stroke="#2563EB" strokeWidth="1.5" fill="none" />
            <path d="M3 12 C7 16, 17 16, 21 12" stroke="#2563EB" strokeWidth="1.5" fill="none" />
            <ellipse cx="12" cy="12" rx="4" ry="9" stroke="#2563EB" strokeWidth="1.5" fill="none" />
            <line x1="12" y1="3" x2="12" y2="21" stroke="#2563EB" strokeWidth="1.5" />
          </svg>
        </div>
        <span style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>
          CricMetrics
        </span>
      </div>
    </div>

    {/* Center: subtitle (hidden on small screens via CSS) */}
    <span className="nav-center-title" style={{ alignItems: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
      IPL Analytics Platform
    </span>

    {/* Right: bell + user avatar */}
    {/* <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Bell size={18} color="rgba(255,255,255,0.7)" style={{ cursor: 'default' }} />
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: '#2563EB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 13, fontWeight: 600,
        cursor: 'default', flexShrink: 0,
      }}>
        MK
      </div>
    </div> */}
  </nav>
)

export default Navbar
