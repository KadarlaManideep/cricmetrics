import React, { useEffect, useMemo, useState } from 'react'
import useCSV from '../hooks/useCSV'
import type { MatchSummaryCSV } from '../types'
import { Trophy } from 'lucide-react'

const HeadToHead: React.FC = () => {
  const { data, loading, error } = useCSV<MatchSummaryCSV>('ipl_match_summary.csv')

  const teams = useMemo(
    () => Array.from(new Set(data.flatMap(d => [d.team1, d.team2].filter(Boolean)))).sort(),
    [data]
  )

  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')

  useEffect(() => {
    if (teams.length >= 2 && !teamA) { setTeamA(teams[0]); setTeamB(teams[1]) }
  }, [teams, teamA])

  const matches = useMemo(() => {
    if (!teamA || !teamB) return []
    return data.filter(m =>
      (m.team1 === teamA && m.team2 === teamB) ||
      (m.team1 === teamB && m.team2 === teamA)
    ).sort((a, b) => Number(a.season) - Number(b.season))
  }, [data, teamA, teamB])

  const winsA = matches.filter(m => m.winner === teamA).length
  const winsB = matches.filter(m => m.winner === teamB).length
  const total = matches.length

  const pctA = total ? (winsA / total) * 100 : 0
  const pctB = total ? (winsB / total) * 100 : 0

  const biggestWinA = useMemo(() => {
    const wins = matches.filter(m => m.winner === teamA && m.result === 'runs')
    return wins.sort((a, b) => Number(b.result_margin) - Number(a.result_margin))[0]
  }, [matches, teamA])

  const biggestWinB = useMemo(() => {
    const wins = matches.filter(m => m.winner === teamB && m.result === 'runs')
    return wins.sort((a, b) => Number(b.result_margin) - Number(a.result_margin))[0]
  }, [matches, teamB])

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error) return <div className="error">Failed to load match data: {error}</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Head to Head</div>
        <div className="page-sub">All-time rivalry records between two teams</div>
      </div>

      <div className="filter-strip">
        <select className="select" value={teamA} onChange={e => setTeamA(e.target.value)}>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{ fontWeight: 600, color: '#9CA3AF', fontSize: 16 }}>vs</span>
        <select className="select" value={teamB} onChange={e => setTeamB(e.target.value)}>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {teamA === teamB && (
        <div style={{ padding: 16, color: '#DC2626', background: '#FEF2F2', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20, fontSize: 14 }}>
          Please select two different teams.
        </div>
      )}

      {teamA !== teamB && (
        <>
          {/* Win summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, maxWidth: 540 }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderTop: '3px solid #2563EB', borderRadius: 10, padding: '16px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                {teamA.split(' ').slice(-1)[0]}
              </div>
              <div style={{ fontSize: 44, fontWeight: 800, color: '#2563EB', letterSpacing: '-1px' }}>{winsA}</div>
            </div>
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Total</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: '#111827', letterSpacing: '-1px' }}>{total}</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderTop: '3px solid #10B981', borderRadius: 10, padding: '16px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                {teamB.split(' ').slice(-1)[0]}
              </div>
              <div style={{ fontSize: 44, fontWeight: 800, color: '#10B981', letterSpacing: '-1px' }}>{winsB}</div>
            </div>
          </div>

          {/* Win % bar */}
          {total > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 6 }}>
                <span style={{ color: '#2563EB', fontWeight: 600 }}>{pctA.toFixed(1)}%</span>
                <span style={{ color: '#10B981', fontWeight: 600 }}>{pctB.toFixed(1)}%</span>
              </div>
              <div className="h2h-bar">
                <div className="seg-a" style={{ flex: pctA }} />
                <div style={{ flex: Math.max(0, 100 - pctA - pctB), background: '#E5E7EB' }} />
                <div className="seg-b" style={{ flex: pctB }} />
              </div>
            </div>
          )}

          {/* Biggest wins */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 28 }}>
            {biggestWinA && (
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderLeft: '3px solid #2563EB', borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                  Biggest Win — {teamA}
                </div>
                <div style={{ fontWeight: 700, color: '#2563EB', fontSize: 14 }}>
                  <Trophy size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                  {biggestWinA.result_margin} runs (S{biggestWinA.season})
                </div>
              </div>
            )}
            {biggestWinB && (
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderLeft: '3px solid #10B981', borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                  Biggest Win — {teamB}
                </div>
                <div style={{ fontWeight: 700, color: '#10B981', fontSize: 14 }}>
                  <Trophy size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                  {biggestWinB.result_margin} runs (S{biggestWinB.season})
                </div>
              </div>
            )}
          </div>

          {/* Match history */}
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
            Match History
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Team 1</th>
                  <th>Team 2</th>
                  <th>Winner</th>
                  <th>Margin</th>
                  <th>POTM</th>
                  <th>Venue</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => {
                  const isPlayoff = m.playoff && String(m.playoff).trim() !== ''
                  return (
                    <tr key={`${m.id}-${i}`}>
                      <td style={{ color: '#9CA3AF', fontSize: 13 }}>{m.season}</td>
                      <td style={{ color: '#6B7280' }}>{m.team1}</td>
                      <td style={{ color: '#6B7280' }}>{m.team2}</td>
                      <td style={{ fontWeight: 700, color: m.winner === teamA ? '#2563EB' : '#10B981' }}>
                        {m.winner || '—'}
                      </td>
                      <td style={{ color: '#6B7280' }}>{m.result_margin ? `${m.result_margin} ${m.result}` : '—'}</td>
                      <td style={{ color: '#6B7280' }}>{m.player_of_match || '—'}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', color: '#9CA3AF', fontSize: 12 }}>{m.venue}</td>
                      <td>{isPlayoff ? <span className="pill pill--amber">{String(m.playoff)}</span> : <span className="pill pill--gray">League</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {matches.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No matches found between these teams.</div>
          )}
        </>
      )}
    </div>
  )
}

export default HeadToHead
