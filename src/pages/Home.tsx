import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useCSV from '../hooks/useCSV'
import StatCard from '../components/StatCard'
import type { BattingCSV, BowlingCSV, MatchSummaryCSV } from '../types'
import { TrendingUp, Zap, Users, Calendar, Swords, Trophy, BarChart2, ListOrdered } from 'lucide-react'

const navItems = [
  { to: '/batting',  icon: TrendingUp, label: 'Batting Stats',  desc: 'Runs, averages, strike rates' },
  { to: '/bowling',  icon: Zap,        label: 'Bowling Stats',  desc: 'Wickets, economy, averages' },
  { to: '/teams',    icon: Users,      label: 'Team Stats',     desc: 'League & playoff performance' },
  { to: '/matches',  icon: Calendar,   label: 'Matches',        desc: 'Browse all IPL matches' },
  { to: '/h2h',      icon: Swords,     label: 'Head to Head',   desc: 'Team rivalry records' },
  { to: '/points',   icon: ListOrdered,label: 'Points Table',   desc: 'Season standings' },
  { to: '/records',  icon: Trophy,     label: 'Records',        desc: 'All-time records & top lists' },
  { to: '/analytics',icon: BarChart2,  label: 'Analytics',      desc: 'Charts & visualizations' },
]

const Home: React.FC = () => {
  const { data: batting, loading: bLoading } = useCSV<BattingCSV>('ipl_player_batting_stats.csv')
  const { data: bowling, loading: bwLoading } = useCSV<BowlingCSV>('ipl_player_bowling_stats.csv')
  const { data: matches } = useCSV<MatchSummaryCSV>('ipl_match_summary.csv')
  const navigate = useNavigate()

  const topRuns = useMemo(() => batting.slice().sort((a, b) => Number(b.runs) - Number(a.runs)).slice(0, 5), [batting])
  const topWkts = useMemo(() => bowling.slice().sort((a, b) => Number(b.wickets_taken) - Number(a.wickets_taken)).slice(0, 5), [bowling])
  const totalTeams = useMemo(() => {
    const teams = new Set(matches.flatMap(m => [m.team1, m.team2].filter(Boolean)))
    return teams.size || 16
  }, [matches])

  return (
    <div>
      {/* Hero strip */}
      <div className="hero-dark">
        <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
          Welcome to CricMetrics
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
          Deep analytics for every IPL season
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/batting')}
            style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
          >
            Explore Stats
          </button>
          <button
            onClick={() => navigate('/analytics')}
            style={{ padding: '10px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stat-grid" style={{ marginBottom: 36 }}>
        <StatCard label="Total Matches" value="816" small="Seasons 2008–2024" color="purple" />
        <StatCard label="Total Players" value="537" small="Across all seasons" color="teal" />
        <StatCard label="Seasons Covered" value="18" small="2008 – 2024" color="amber" />
        <StatCard label="Total Teams" value={totalTeams || 16} small="Incl. all franchises" color="coral" />
      </div>

      {/* Leaderboards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 44 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', borderLeft: '3px solid #2563EB', paddingLeft: 12 }}>
              Top Run Scorers
            </span>
            <button
              onClick={() => navigate('/batting')}
              style={{ fontSize: 12, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              View all →
            </button>
          </div>
          <div className="leaderboard">
            {bLoading
              ? <div style={{ padding: 24, textAlign: 'center' }}><div className="spinner" /></div>
              : topRuns.map((r, i) => (
                <div key={r.batsman} className="lb-row" onClick={() => navigate(`/player/${encodeURIComponent(r.batsman)}`)}>
                  <span className="lb-rank">{i + 1}</span>
                  <span className="lb-name">{r.batsman}</span>
                  <span className="lb-val">{Number(r.runs).toFixed(0)}</span>
                </div>
              ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', borderLeft: '3px solid #2563EB', paddingLeft: 12 }}>
              Top Wicket Takers
            </span>
            <button
              onClick={() => navigate('/bowling')}
              style={{ fontSize: 12, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              View all →
            </button>
          </div>
          <div className="leaderboard">
            {bwLoading
              ? <div style={{ padding: 24, textAlign: 'center' }}><div className="spinner" /></div>
              : topWkts.map((r, i) => (
                <div key={r.bowler} className="lb-row" onClick={() => navigate(`/player/${encodeURIComponent(r.bowler)}`)}>
                  <span className="lb-rank">{i + 1}</span>
                  <span className="lb-name">{r.bowler}</span>
                  <span className="lb-val">{Number(r.wickets_taken).toFixed(0)} wkts</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Explore section */}
      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', borderLeft: '3px solid #2563EB', paddingLeft: 12, marginBottom: 16 }}>
        Explore
      </div>
      <div className="nav-cards">
        {navItems.map((n) => {
          const Icon = n.icon
          return (
            <div key={n.to} className="nav-card" onClick={() => navigate(n.to)}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={18} color="#2563EB" />
              </div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: 13, marginBottom: 4 }}>{n.label}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.4 }}>{n.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Home
