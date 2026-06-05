import React, { useMemo } from 'react'
import useCSV from '../hooks/useCSV'
import type { MatchSummaryCSV, MatchStatsCSV } from '../types'

const Records: React.FC = () => {
  const { data: summary, loading: sLoad } = useCSV<MatchSummaryCSV>('ipl_match_summary.csv')
  const { data: stats, loading: stLoad } = useCSV<MatchStatsCSV>('ipl_match_stats.csv')

  const topPOTM = useMemo(() => {
    const counts: Record<string, number> = {}
    summary.forEach(s => {
      const p = s.player_of_match
      if (p && String(p).trim()) counts[p] = (counts[p] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [summary])

  const biggestByRuns = useMemo(
    () => summary.filter(s => String(s.result).toLowerCase() === 'runs')
      .sort((a, b) => Number(b.result_margin) - Number(a.result_margin))
      .slice(0, 5),
    [summary]
  )

  const biggestByWickets = useMemo(
    () => summary.filter(s => String(s.result).toLowerCase() === 'wickets')
      .sort((a, b) => Number(b.result_margin) - Number(a.result_margin))
      .slice(0, 5),
    [summary]
  )

  const highestScoring = useMemo(() => {
    const byId: Record<string, { runs: number; teams: string[] }> = {}
    stats.forEach(s => {
      if (!byId[s.id]) byId[s.id] = { runs: 0, teams: [] }
      byId[s.id].runs += Number(s.runs)
    })
    summary.forEach(m => {
      if (byId[m.id]) byId[m.id].teams = [m.team1, m.team2]
    })
    return Object.entries(byId)
      .map(([id, v]) => ({ id, runs: v.runs, teams: v.teams }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5)
  }, [stats, summary])

  if (sLoad || stLoad) return <div className="loading"><div className="spinner" /></div>

  type CardItem = { rank: number; name: string; value: string; sub?: string }

  const ACCENT_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444']

  const RecordCard = ({ title, items, accentColor }: { title: string; items: CardItem[]; accentColor: string }) => (
    <div className="record-card">
      <div className="record-card-title" style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 10 }}>{title}</div>
      {items.map(item => (
        <div key={item.rank} className="record-row">
          <span className="record-row-rank">{item.rank}</span>
          <span className="record-row-name">
            {item.name}
            {item.sub && <span style={{ color: '#D1D5DB', fontSize: 11, marginLeft: 6 }}>{item.sub}</span>}
          </span>
          <span className="record-row-val" style={{ color: accentColor }}>{item.value}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Records</div>
        <div className="page-sub">All-time IPL top lists and milestones</div>
      </div>

      <div className="records-grid">
        <RecordCard
          title="Most Player of the Match"
          accentColor={ACCENT_COLORS[0]}
          items={topPOTM.map(([p, c], i) => ({ rank: i + 1, name: p, value: `${c} awards` }))}
        />
        <RecordCard
          title="Biggest Wins by Runs"
          accentColor={ACCENT_COLORS[1]}
          items={biggestByRuns.map((m, i) => ({
            rank: i + 1,
            name: m.winner,
            value: `${m.result_margin} runs`,
            sub: `S${m.season}`,
          }))}
        />
        <RecordCard
          title="Biggest Wins by Wickets"
          accentColor={ACCENT_COLORS[2]}
          items={biggestByWickets.map((m, i) => ({
            rank: i + 1,
            name: m.winner,
            value: `${m.result_margin} wkts`,
            sub: `S${m.season}`,
          }))}
        />
        <RecordCard
          title="Highest Scoring Matches"
          accentColor={ACCENT_COLORS[3]}
          items={highestScoring.map((h, i) => ({
            rank: i + 1,
            name: h.teams.join(' vs ') || `Match ${h.id}`,
            value: `${h.runs.toFixed(0)} runs`,
          }))}
        />
      </div>
    </div>
  )
}

export default Records
