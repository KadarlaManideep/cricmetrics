import React, { useEffect, useMemo, useState } from 'react'
import useCSV from '../hooks/useCSV'
import type { TeamLeagueCSV, TeamPlayoffCSV } from '../types'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, Legend, CartesianGrid
} from 'recharts'

function runRate(runs: number, deliveries: number) {
  if (!deliveries) return 0
  return (runs / deliveries) * 6
}

function ecoRate(runs: number, deliveries: number) {
  if (!deliveries) return 0
  return (runs / deliveries) * 6
}

type StageStats = TeamLeagueCSV | TeamPlayoffCSV

const TOOLTIP_STYLE = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  color: '#111827',
  borderRadius: 8,
  fontSize: 12,
}
const AXIS_TICK = { fontSize: 11, fill: '#9CA3AF' }
const GRID_COLOR = '#F3F4F6'

function StatRow({ label, val }: { label: string; val: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 }}>
      <span style={{ color: '#6B7280' }}>{label}</span>
      <span style={{ fontWeight: 700, color: '#111827' }}>{val}</span>
    </div>
  )
}

const TeamStats: React.FC = () => {
  const { data: league, loading: lLoad } = useCSV<TeamLeagueCSV>('team_league_stats.csv')
  const { data: playoffs, loading: pLoad } = useCSV<TeamPlayoffCSV>('team_playoff_stats.csv')

  const teams = useMemo(() => Array.from(new Set(league.map(l => String(l.team)))).sort(), [league])
  const seasons = useMemo(() => Array.from(new Set(league.map(l => String(l.season)))).sort((a, b) => Number(b) - Number(a)), [league])

  const [team, setTeam] = useState('')
  const [season, setSeason] = useState('')

  useEffect(() => { if (teams.length && !team) setTeam(teams[0]) }, [teams, team])
  useEffect(() => { if (seasons.length && !season) setSeason(seasons[0]) }, [seasons, season])

  const leagueRow = league.find(l => l.team === team && String(l.season) === season)
  const playoffRow = playoffs.find(p => p.team === team && String(p.season) === season)

  const trendData = useMemo(() => {
    const allSeasons = Array.from(new Set(league.map(l => String(l.season)))).sort((a, b) => Number(a) - Number(b))
    return allSeasons.map(s => {
      const lr = league.find(l => l.team === team && String(l.season) === s)
      const pr = playoffs.find(p => p.team === team && String(p.season) === s)
      return {
        season: s,
        leagueRuns: lr ? Number(lr.runs_scored) : null,
        playoffRuns: pr ? Number(pr.runs_scored) : null,
        leagueRR: lr ? +runRate(Number(lr.runs_scored), Number(lr.deliveries_faced)).toFixed(2) : null,
      }
    })
  }, [league, playoffs, team])

  if (lLoad || pLoad) return <div className="loading"><div className="spinner" /></div>

  const CARD_STYLE = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }

  const renderStats = (row: StageStats | undefined, label: string, accentColor: string) => {
    if (!row) return (
      <div style={{ ...CARD_STYLE, color: '#9CA3AF', fontSize: 13, textAlign: 'center' as const, padding: 32 }}>
        No {label} data for this team / season.
      </div>
    )
    return (
      <div style={CARD_STYLE}>
        <div style={{ fontSize: 11, fontWeight: 600, color: accentColor, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 14, borderBottom: `2px solid ${accentColor}`, display: 'inline-block', paddingBottom: 4 }}>
          {label}
        </div>
        <StatRow label="Runs Scored" val={Number(row.runs_scored).toFixed(0)} />
        <StatRow label="Wickets Lost" val={Number(row.wickets_lost).toFixed(0)} />
        <StatRow label="Run Rate" val={runRate(Number(row.runs_scored), Number(row.deliveries_faced)).toFixed(2)} />
        <StatRow label="Fours" val={Number(row.fours).toFixed(0)} />
        <StatRow label="Sixes" val={Number(row.sixers).toFixed(0)} />
        <StatRow label="Economy (bowling)" val={ecoRate(Number(row.runs_allowed), Number(row.deliveries_bowled)).toFixed(2)} />
        <StatRow label="Wickets Taken" val={Number(row.wickets_taken).toFixed(0)} />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Team Stats</div>
        <div className="page-sub">League stage vs playoff performance by season</div>
      </div>

      <div className="filter-strip">
        <select className="select" value={team} onChange={e => setTeam(e.target.value)}>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="select" value={season} onChange={e => setSeason(e.target.value)}>
          {seasons.map(s => <option key={s} value={s}>Season {s}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
        {renderStats(leagueRow, 'League Stage', '#2563EB')}
        {renderStats(playoffRow, 'Playoffs', '#10B981')}
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ fontWeight: 700, color: '#111827', marginBottom: 16, fontSize: 15 }}>Runs Scored per Season (League vs Playoff)</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={trendData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="season" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: '#6B7280', fontSize: 12 }} />
            <Bar dataKey="leagueRuns" name="League" fill="#2563EB" radius={[3, 3, 0, 0]} />
            <Bar dataKey="playoffRuns" name="Playoff" fill="#10B981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ fontWeight: 700, color: '#111827', marginBottom: 16, fontSize: 15 }}>League Run Rate Trend per Season</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="season" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
            <YAxis domain={['auto', 'auto']} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => typeof v === 'number' ? v.toFixed(2) : String(v ?? '')} />
            <Line dataKey="leagueRR" name="Run Rate" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TeamStats
