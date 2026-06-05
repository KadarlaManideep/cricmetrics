import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCSV from '../hooks/useCSV'
import type { BowlingCSV } from '../types'
import { bowlingAverage, dotBallPercentBowling } from '../utils/stats'
import { usePagination } from '../hooks/usePagination'
import Pagination from '../components/Pagination'

type SortMode = 'wkts' | 'eco' | 'dots' | 'avg'

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'wkts', label: 'Most Wickets' },
  { key: 'eco',  label: 'Best Economy' },
  { key: 'dots', label: 'Most Dots' },
  { key: 'avg',  label: 'Best Avg' },
]

function ecoPill(eco: number) {
  const s = eco.toFixed(1)
  if (eco < 7) return <span className="pill pill--green">{s}</span>
  if (eco <= 9) return <span className="pill pill--amber">{s}</span>
  return <span className="pill pill--red">{s}</span>
}

const Bowling: React.FC = () => {
  const { data, loading, error } = useCSV<BowlingCSV>('ipl_player_bowling_stats.csv')
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('wkts')
  const navigate = useNavigate()

  const rows = useMemo(() => {
    let out = data.filter(r => r.bowler && String(r.bowler).trim())
    if (query) out = out.filter(r => String(r.bowler).toLowerCase().includes(query.toLowerCase()))
    return out.slice().sort((a, b) => {
      if (sortMode === 'wkts') return Number(b.wickets_taken) - Number(a.wickets_taken)
      if (sortMode === 'dots') return Number(b.dots) - Number(a.dots)
      if (sortMode === 'eco') {
        const ecoA = Number(a.deliveries_bowled) ? (Number(a.runs_allowed) / Number(a.deliveries_bowled)) * 6 : 99
        const ecoB = Number(b.deliveries_bowled) ? (Number(b.runs_allowed) / Number(b.deliveries_bowled)) * 6 : 99
        return ecoA - ecoB
      }
      if (sortMode === 'avg') {
        const avgA = Number(a.wickets_taken) ? Number(a.runs_allowed) / Number(a.wickets_taken) : 999
        const avgB = Number(b.wickets_taken) ? Number(b.runs_allowed) / Number(b.wickets_taken) : 999
        return avgA - avgB
      }
      return 0
    })
  }, [data, query, sortMode])

  const { page, setPage, pageData, totalPages, from, to, total, offset } = usePagination(rows)

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error) return <div className="error">Failed to load bowling data: {error}</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Bowling Stats</div>
        <div className="page-sub">{data.length} players · Click any row to view full profile</div>
      </div>

      <div className="controls-card">
        <input
          className="search-input"
          placeholder="Search bowler…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="sort-strip">
          {SORT_OPTIONS.map(s => (
            <button key={s.key} className={`sort-btn${sortMode === s.key ? ' active' : ''}`} onClick={() => setSortMode(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>#</th>
              <th>Bowler</th>
              <th>Wickets</th>
              <th>Runs</th>
              <th>Balls</th>
              <th>Economy</th>
              <th>Avg</th>
              <th>Dots</th>
              <th>Dot%</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r, i) => {
              const ecoVal = Number(r.deliveries_bowled) ? (Number(r.runs_allowed) / Number(r.deliveries_bowled)) * 6 : 0
              return (
                <tr key={r.bowler} className="player-row" onClick={() => navigate(`/player/${encodeURIComponent(r.bowler)}`)}>
                  <td style={{ color: '#D1D5DB', fontSize: 12 }}>{offset + i + 1}</td>
                  <td style={{ fontWeight: 600, color: '#2563EB' }}>{r.bowler}</td>
                  <td style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{Number(r.wickets_taken).toFixed(0)}</td>
                  <td style={{ color: '#6B7280' }}>{Number(r.runs_allowed).toFixed(0)}</td>
                  <td style={{ color: '#6B7280' }}>{Number(r.deliveries_bowled).toFixed(0)}</td>
                  <td>{ecoPill(ecoVal)}</td>
                  <td style={{ color: '#6B7280' }}>{bowlingAverage(Number(r.runs_allowed), Number(r.wickets_taken))}</td>
                  <td style={{ color: '#6B7280' }}>{Number(r.dots).toFixed(0)}</td>
                  <td style={{ color: '#6B7280' }}>{dotBallPercentBowling(Number(r.dots), Number(r.deliveries_bowled))}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} from={from} to={to} total={total} />
      {rows.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No players match your search.</div>
      )}
    </div>
  )
}

export default Bowling
