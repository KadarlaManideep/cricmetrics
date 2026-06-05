import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCSV from '../hooks/useCSV'
import type { BattingCSV } from '../types'
import { battingAverage, dotBallPercentBatting } from '../utils/stats'
import { usePagination } from '../hooks/usePagination'
import Pagination from '../components/Pagination'

type SortMode = 'runs' | 'sr' | 'sixes' | 'avg'

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'runs',  label: 'Most Runs' },
  { key: 'sr',   label: 'Best SR' },
  { key: 'sixes',label: 'Most 6s' },
  { key: 'avg',  label: 'Best Avg' },
]

function srPill(srVal: number) {
  const s = srVal.toFixed(1)
  if (srVal > 140) return <span className="pill pill--green">{s}</span>
  if (srVal >= 120) return <span className="pill pill--amber">{s}</span>
  return <span className="pill pill--gray">{s}</span>
}

const Batting: React.FC = () => {
  const { data, loading, error } = useCSV<BattingCSV>('ipl_player_batting_stats.csv')
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('runs')
  const navigate = useNavigate()

  const rows = useMemo(() => {
    let out = data.filter(r => r.batsman && String(r.batsman).trim())
    if (query) out = out.filter(r => String(r.batsman).toLowerCase().includes(query.toLowerCase()))
    return out.slice().sort((a, b) => {
      if (sortMode === 'runs') return Number(b.runs) - Number(a.runs)
      if (sortMode === 'sixes') return Number(b.sixers) - Number(a.sixers)
      if (sortMode === 'sr') {
        const srA = Number(a.deliveries_faced) ? (Number(a.runs) / Number(a.deliveries_faced)) * 100 : 0
        const srB = Number(b.deliveries_faced) ? (Number(b.runs) / Number(b.deliveries_faced)) * 100 : 0
        return srB - srA
      }
      if (sortMode === 'avg') {
        const avgA = Number(a.outs) ? Number(a.runs) / Number(a.outs) : 0
        const avgB = Number(b.outs) ? Number(b.runs) / Number(b.outs) : 0
        return avgB - avgA
      }
      return 0
    })
  }, [data, query, sortMode])

  const { page, setPage, pageData, totalPages, from, to, total, offset } = usePagination(rows)

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error) return <div className="error">Failed to load batting data: {error}</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Batting Stats</div>
        <div className="page-sub">{data.length} players · Click any row to view full profile</div>
      </div>

      <div className="controls-card">
        <input
          className="search-input"
          placeholder="Search player…"
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
              <th>Player</th>
              <th>Runs</th>
              <th>Balls</th>
              <th>Avg</th>
              <th>SR</th>
              <th>4s</th>
              <th>6s</th>
              <th>Dot%</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r, i) => {
              const srVal = Number(r.deliveries_faced) ? (Number(r.runs) / Number(r.deliveries_faced)) * 100 : 0
              return (
                <tr key={r.batsman} className="player-row" onClick={() => navigate(`/player/${encodeURIComponent(r.batsman)}`)}>
                  <td style={{ color: '#D1D5DB', fontSize: 12 }}>{offset + i + 1}</td>
                  <td style={{ fontWeight: 600, color: '#2563EB' }}>{r.batsman}</td>
                  <td style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{Number(r.runs).toFixed(0)}</td>
                  <td style={{ color: '#6B7280' }}>{Number(r.deliveries_faced).toFixed(0)}</td>
                  <td style={{ color: '#6B7280' }}>{battingAverage(Number(r.runs), Number(r.outs))}</td>
                  <td>{srPill(srVal)}</td>
                  <td style={{ color: '#6B7280' }}>{Number(r.fours).toFixed(0)}</td>
                  <td style={{ color: '#6B7280' }}>{Number(r.sixers).toFixed(0)}</td>
                  <td style={{ color: '#6B7280' }}>{dotBallPercentBatting(Number(r.dots), Number(r.deliveries_faced))}%</td>
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

export default Batting
