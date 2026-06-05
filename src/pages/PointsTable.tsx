import React, { useEffect, useMemo, useState } from 'react'
import useCSV from '../hooks/useCSV'
import type { PointsTableCSV } from '../types'

const PointsTable: React.FC = () => {
  const { data, loading, error } = useCSV<PointsTableCSV>('points_table.csv')
  const seasons = useMemo(
    () => Array.from(new Set(data.map(d => String(d.season)))).sort((a, b) => Number(b) - Number(a)),
    [data]
  )
  const [season, setSeason] = useState('')

  useEffect(() => {
    if (seasons.length && !season) setSeason(seasons[0])
  }, [seasons, season])

  const table = useMemo(
    () => data.filter(d => String(d.season) === season).sort((a, b) => Number(a.rank) - Number(b.rank)),
    [data, season]
  )

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error) return <div className="error">Failed to load points table: {error}</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Points Table</div>
        <div className="page-sub">Season standings — top 4 qualify for playoffs</div>
      </div>

      <div className="filter-strip">
        <select className="select" value={season} onChange={e => setSeason(e.target.value)}>
          {seasons.map(s => <option key={s} value={s}>Season {s}</option>)}
        </select>
      </div>

      {table.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Select a season above.</div>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Short</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>NR</th>
              <th>Pts</th>
              <th>NRR</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {table.map((r, i) => {
              const qualified = i < 4
              return (
                <tr key={`${r.name}-${i}`} className={qualified ? 'qualified-row' : ''}>
                  <td style={{ fontWeight: 700, color: qualified ? '#2563EB' : '#6B7280' }}>{r.rank}</td>
                  <td style={{ fontWeight: 700, color: '#111827' }}>{r.name}</td>
                  <td style={{ color: '#9CA3AF', fontSize: 12 }}>{r.short_name}</td>
                  <td style={{ color: '#6B7280' }}>{Number(r.played).toFixed(0)}</td>
                  <td style={{ fontWeight: 600, color: '#059669' }}>{Number(r.won).toFixed(0)}</td>
                  <td style={{ color: '#DC2626' }}>{Number(r.lost).toFixed(0)}</td>
                  <td style={{ color: '#9CA3AF' }}>{Number(r.noresult).toFixed(0)}</td>
                  <td style={{ fontWeight: 700, color: '#111827' }}>{Number(r.points).toFixed(0)}</td>
                  <td style={{ fontWeight: 600, color: Number(r.nrr) >= 0 ? '#059669' : '#DC2626' }}>
                    {Number(r.nrr) >= 0 ? '+' : ''}{Number(r.nrr).toFixed(3)}
                  </td>
                  <td>
                    {qualified
                      ? <span className="pill pill--purple">Qualified</span>
                      : <span className="pill pill--gray">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PointsTable
