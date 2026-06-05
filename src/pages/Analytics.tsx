import React, { useEffect, useMemo, useState } from 'react'
import useCSV from '../hooks/useCSV'
import type { BattingCSV, TeamLeagueCSV, PointsTableCSV } from '../types'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, CartesianGrid
} from 'recharts'

const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#9CA3AF']
const TOOLTIP_STYLE = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  color: '#111827',
  borderRadius: 8,
  fontSize: 12,
}
const AXIS_TICK = { fontSize: 11, fill: '#9CA3AF' }
const GRID_COLOR = '#F3F4F6'
const LEGEND_STYLE = { color: '#6B7280', fontSize: 12 }

const fmt = (v: unknown) => typeof v === 'number' ? v.toFixed(0) : String(v ?? '')
const fmt2 = (v: unknown) => typeof v === 'number' ? v.toFixed(2) : String(v ?? '')

const CARD_STYLE = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 10,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}

const ChartCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div style={CARD_STYLE}>
    <div style={{ fontWeight: 700, color: '#111827', fontSize: 15, marginBottom: subtitle ? 4 : 16 }}>{title}</div>
    {subtitle && <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>{subtitle}</div>}
    {children}
  </div>
)

const Analytics: React.FC = () => {
  const { data: batting, loading: bLoad } = useCSV<BattingCSV>('ipl_player_batting_stats.csv')
  const { data: teamLeague, loading: tLoad } = useCSV<TeamLeagueCSV>('team_league_stats.csv')
  const { data: pointsTable } = useCSV<PointsTableCSV>('points_table.csv')

  const [mode, setMode] = useState<'player' | 'team'>('player')
  const [entity, setEntity] = useState('')

  const playerNames = useMemo(() => batting.map(b => b.batsman).filter(Boolean).sort(), [batting])
  const teamNames = useMemo(() => Array.from(new Set(teamLeague.map(t => t.team))).sort(), [teamLeague])

  useEffect(() => {
    if (mode === 'player' && playerNames.length && !entity) setEntity(playerNames[0])
  }, [playerNames, mode, entity])

  useEffect(() => {
    if (mode === 'team' && teamNames.length && !entity) setEntity(teamNames[0])
  }, [teamNames, mode, entity])

  const handleModeChange = (m: 'player' | 'team') => {
    setMode(m)
    setEntity('')
  }

  const isLoading = (mode === 'player' && bLoad) || (mode === 'team' && tLoad)

  const playerBat = batting.find(b => b.batsman === entity)

  const runDistData = useMemo(() => {
    if (!playerBat) return []
    return [
      { name: 'Dots', value: Number(playerBat.dots) },
      { name: 'Singles', value: Number(playerBat.singles) },
      { name: 'Doubles', value: Number(playerBat.doubles) },
      { name: '4s', value: Number(playerBat.fours) },
      { name: '6s', value: Number(playerBat.sixers) },
    ].filter(d => d.value > 0)
  }, [playerBat])

  const dismissalData = useMemo(() => {
    if (!playerBat) return []
    return [
      { name: 'Bowled', value: Number(playerBat.bowled) },
      { name: 'Caught', value: Number(playerBat.catches) },
      { name: 'Run Out', value: Number(playerBat.run_outs) },
    ]
  }, [playerBat])

  const top10FoursVsSixes = useMemo(() => {
    return batting
      .slice()
      .sort((a, b) => (Number(b.fours) + Number(b.sixers)) - (Number(a.fours) + Number(a.sixers)))
      .slice(0, 10)
      .map(b => ({ name: b.batsman.split(' ').slice(-1)[0], Fours: Number(b.fours), Sixes: Number(b.sixers) }))
  }, [batting])

  const ballsProfile = useMemo(() => {
    if (!playerBat) return []
    const boundary = Number(playerBat.fours) + Number(playerBat.sixers)
    const dots = Number(playerBat.dots)
    const running = Number(playerBat.deliveries_faced) - boundary - dots
    return [
      { name: 'Boundary Balls', value: boundary },
      { name: 'Running Balls', value: Math.max(0, running) },
      { name: 'Dot Balls', value: dots },
    ].filter(d => d.value > 0)
  }, [playerBat])

  const teamSeasonData = useMemo(() => {
    return teamLeague
      .filter(t => t.team === entity)
      .sort((a, b) => Number(a.season) - Number(b.season))
      .map(t => ({
        season: String(t.season),
        runs: Number(t.runs_scored),
        wickets: Number(t.wickets_taken),
        fours: Number(t.fours),
        sixers: Number(t.sixers),
        economy: Number(t.deliveries_bowled)
          ? +((Number(t.runs_allowed) / Number(t.deliveries_bowled)) * 6).toFixed(2)
          : 0,
      }))
  }, [teamLeague, entity])

  const winPct = useMemo(() => {
    if (!entity) return []
    const rows = pointsTable.filter(p => p.name === entity)
    const totalWon = rows.reduce((s, r) => s + Number(r.won), 0)
    const totalPlayed = rows.reduce((s, r) => s + Number(r.played), 0)
    const lost = totalPlayed - totalWon
    return [
      { name: 'Won', value: totalWon },
      { name: 'Lost', value: lost },
    ]
  }, [pointsTable, entity])

  if (isLoading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      {/* Dark header — title */}
      <div className="analytics-hero-top">
        <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: 4 }}>Analytics</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Deep-dive charts for players and teams</div>
      </div>

      {/* Dark header — controls */}
      <div className="analytics-hero-controls">
        <div className="toggle-strip-dark">
          <button className={`toggle-btn-dark${mode === 'player' ? ' active' : ''}`} onClick={() => handleModeChange('player')}>
            Player
          </button>
          <button className={`toggle-btn-dark${mode === 'team' ? ' active' : ''}`} onClick={() => handleModeChange('team')}>
            Team
          </button>
        </div>
        <select
          className="select-dark"
          value={entity}
          onChange={e => setEntity(e.target.value)}
          style={{ minWidth: 220, maxWidth: 340 }}
        >
          {(mode === 'player' ? playerNames : teamNames).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Charts — light section */}
      <div style={{ paddingTop: 28 }}>

        {/* ── Player Charts ────────────────────────────── */}
        {mode === 'player' && playerBat && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 0 }}>
              <ChartCard title="Run Distribution" subtitle="Breakdown of balls faced by outcome">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={runDistData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label={({ name, percent }) =>
                        `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
                      }
                      labelLine={{ stroke: '#D1D5DB' }}
                    >
                      {runDistData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Dismissal Types" subtitle="How this player got out">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dismissalData} barSize={48}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                    <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title={`Career Milestones — ${entity}`} subtitle="Runs, boundaries and dot balls overview">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{
                  name: entity.split(' ').slice(-1)[0],
                  Runs: Number(playerBat.runs),
                  Fours: Number(playerBat.fours),
                  Sixes: Number(playerBat.sixers),
                  Dots: Number(playerBat.dots),
                }]} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                  <Legend wrapperStyle={LEGEND_STYLE} />
                  <Bar dataKey="Runs" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Fours" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sixes" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Dots" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top 10 Players — Fours vs Sixes" subtitle="All-time boundary leaders comparison">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={top10FoursVsSixes} barGap={2} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                  <Legend wrapperStyle={LEGEND_STYLE} />
                  <Bar dataKey="Fours" fill="#10B981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Sixes" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Balls Faced Profile" subtitle="Boundary balls vs running balls vs dot balls">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={ballsProfile} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                    {ballsProfile.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                  <Legend wrapperStyle={LEGEND_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}

        {mode === 'player' && !playerBat && (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            No batting data for this player.
          </div>
        )}

        {/* ── Team Charts ──────────────────────────────── */}
        {mode === 'team' && (
          <>
            <ChartCard title="Runs Scored per Season" subtitle="League stage run scoring trend">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={teamSeasonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="season" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                  <Line dataKey="runs" name="Runs" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Wickets Taken per Season" subtitle="Bowling effectiveness over the years">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teamSeasonData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="season" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                  <Bar dataKey="wickets" name="Wickets" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Fours + Sixes per Season" subtitle="Boundary hitting trend (stacked)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teamSeasonData} barGap={2} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="season" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                  <Legend wrapperStyle={LEGEND_STYLE} />
                  <Bar dataKey="fours" name="Fours" fill="#2563EB" stackId="b" />
                  <Bar dataKey="sixers" name="Sixes" fill="#F59E0B" stackId="b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Bowling Economy per Season" subtitle="Runs allowed per 6 balls across seasons">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={teamSeasonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="season" tick={AXIS_TICK} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt2} />
                  <Line dataKey="economy" name="Economy" stroke="#EF4444" strokeWidth={2} dot={{ r: 3, fill: '#EF4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <ChartCard title={`Win % — ${entity}`} subtitle="Won vs lost across all seasons">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={winPct}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      label={({ name, percent }) =>
                        `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
                      }
                      labelLine={{ stroke: '#D1D5DB' }}
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={fmt} />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Analytics
