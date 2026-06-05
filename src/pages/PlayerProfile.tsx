import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useCSV from '../hooks/useCSV'
import type { BattingCSV, BowlingCSV } from '../types'
import {
  battingAverage, strikeRate, boundaryPercent,
  dotBallPercentBatting, economy, bowlingAverage, dotBallPercentBowling
} from '../utils/stats'
import StatCard from '../components/StatCard'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { ArrowLeft } from 'lucide-react'

const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#9CA3AF']
const TOOLTIP_STYLE = { background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#111827', borderRadius: 8, fontSize: 12 }
const AXIS_TICK = { fontSize: 11, fill: '#9CA3AF' }
const GRID_COLOR = '#F3F4F6'

const CARD_STYLE = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 10,
  padding: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}

const PlayerProfile: React.FC = () => {
  const { name } = useParams()
  const navigate = useNavigate()
  const decoded = name ? decodeURIComponent(name) : ''

  const { data: batting, loading: bLoad } = useCSV<BattingCSV>('ipl_player_batting_stats.csv')
  const { data: bowling, loading: bwLoad } = useCSV<BowlingCSV>('ipl_player_bowling_stats.csv')

  const bat = batting.find(b => b.batsman === decoded)
  const bowl = bowling.find(b => b.bowler === decoded)

  const initials = decoded.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase()

  const isAllRounder = !!(bat && bowl)
  const role = isAllRounder ? 'All-Rounder' : bat ? 'Batsman' : bowl ? 'Bowler' : 'Unknown'

  const runDistData = useMemo(() => {
    if (!bat) return []
    const fours = Number(bat.fours)
    const sixers = Number(bat.sixers)
    const dots = Number(bat.dots)
    const singles = Number(bat.singles)
    const doubles = Number(bat.doubles)
    return [
      { name: 'Dots', value: dots },
      { name: 'Singles', value: singles },
      { name: 'Doubles', value: doubles },
      { name: '4s', value: fours },
      { name: '6s', value: sixers },
    ].filter(d => d.value > 0)
  }, [bat])

  const dismissalData = useMemo(() => {
    if (!bat) return []
    return [
      { name: 'Bowled', value: Number(bat.bowled) },
      { name: 'Caught', value: Number(bat.catches) },
      { name: 'Run Out', value: Number(bat.run_outs) },
    ]
  }, [bat])

  const bowlBreakdown = useMemo(() => {
    if (!bowl) return []
    return [
      { name: 'Wickets', value: Number(bowl.wickets_taken) },
      { name: 'Dots', value: Number(bowl.dots) },
      { name: '4s given', value: Number(bowl.fours) },
      { name: '6s given', value: Number(bowl.sixers) },
    ]
  }, [bowl])

  if (bLoad || bwLoad) return <div className="loading"><div className="spinner" /></div>
  if (!bat && !bowl) {
    return (
      <div style={{ paddingTop: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontWeight: 500, fontSize: 13 }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>No data found for "{decoded}".</div>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <div style={{ paddingTop: 20, paddingBottom: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 13, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1D4ED8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#2563EB')}
        >
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      {/* Profile hero */}
      <div className="profile-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div className="avatar">{initials}</div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>{decoded}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                {role}
              </span>
              {bat && (
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                  {Number(bat.runs).toFixed(0)} runs
                </span>
              )}
              {bowl && (
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                  {Number(bowl.wickets_taken).toFixed(0)} wickets
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 28 }}>

        {/* Batting section */}
        {bat && (
          <section style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
              Batting Career
            </div>
            <div className="stat-grid">
              <StatCard label="Runs" value={Number(bat.runs).toFixed(0)} />
              <StatCard label="Dismissals" value={Number(bat.outs).toFixed(0)} color="teal" />
              <StatCard label="Strike Rate" value={strikeRate(Number(bat.runs), Number(bat.deliveries_faced))} color="amber" />
              <StatCard label="Average" value={battingAverage(Number(bat.runs), Number(bat.outs))} />
              <StatCard label="Boundary %" value={boundaryPercent(Number(bat.fours), Number(bat.sixers), Number(bat.deliveries_faced)) + '%'} color="teal" />
              <StatCard label="Dot Ball %" value={dotBallPercentBatting(Number(bat.dots), Number(bat.deliveries_faced)) + '%'} color="coral" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 20 }}>
              <div style={CARD_STYLE}>
                <div style={{ fontWeight: 700, color: '#111827', marginBottom: 16, fontSize: 15 }}>Run Distribution</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={runDistData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={85}
                      label={({ name, percent }) =>
                        `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
                      }
                      labelLine={{ stroke: '#D1D5DB' }}
                    >
                      {runDistData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => typeof v === 'number' ? v.toFixed(0) : String(v ?? '')} />
                    <Legend wrapperStyle={{ color: '#6B7280', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={CARD_STYLE}>
                <div style={{ fontWeight: 700, color: '#111827', marginBottom: 16, fontSize: 15 }}>Dismissal Types</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dismissalData} barSize={44}>
                    <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => typeof v === 'number' ? v.toFixed(0) : String(v ?? '')} />
                    <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...CARD_STYLE, marginTop: 16 }}>
              <div style={{ fontWeight: 700, color: '#111827', marginBottom: 16, fontSize: 15 }}>Career Breakdown</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[{
                  name: decoded.split(' ')[0],
                  Runs: Number(bat.runs),
                  Fours: Number(bat.fours),
                  Sixes: Number(bat.sixers),
                }]} barSize={44}>
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => typeof v === 'number' ? v.toFixed(0) : String(v ?? '')} />
                  <Legend wrapperStyle={{ color: '#6B7280', fontSize: 12 }} />
                  <Bar dataKey="Runs" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Fours" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sixes" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Bowling section */}
        {bowl && (
          <section>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
              Bowling Career
            </div>
            <div className="stat-grid">
              <StatCard label="Wickets" value={Number(bowl.wickets_taken).toFixed(0)} />
              <StatCard label="Runs Given" value={Number(bowl.runs_allowed).toFixed(0)} color="coral" />
              <StatCard label="Economy" value={economy(Number(bowl.runs_allowed), Number(bowl.deliveries_bowled))} color="amber" />
              <StatCard label="Average" value={bowlingAverage(Number(bowl.runs_allowed), Number(bowl.wickets_taken))} color="teal" />
              <StatCard label="Dot Ball %" value={dotBallPercentBowling(Number(bowl.dots), Number(bowl.deliveries_bowled)) + '%'} />
            </div>

            <div style={{ ...CARD_STYLE, marginTop: 16 }}>
              <div style={{ fontWeight: 700, color: '#111827', marginBottom: 16, fontSize: 15 }}>Bowling Breakdown</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={bowlBreakdown} barSize={44}>
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => typeof v === 'number' ? v.toFixed(0) : String(v ?? '')} />
                  <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default PlayerProfile
