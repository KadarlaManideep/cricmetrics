import React, { useEffect, useMemo, useState } from 'react'
import useCSV from '../hooks/useCSV'
import type { MatchSummaryCSV } from '../types'
import { MapPin, User, Trophy } from 'lucide-react'
import { usePagination } from '../hooks/usePagination'
import Pagination from '../components/Pagination'

const Matches: React.FC = () => {
  const { data, loading, error } = useCSV<MatchSummaryCSV>('ipl_match_summary.csv')

  const seasons = useMemo(
    () => Array.from(new Set(data.map(d => String(d.season)))).sort((a, b) => Number(b) - Number(a)),
    [data]
  )
  const teams = useMemo(
    () => Array.from(new Set(data.flatMap(d => [d.team1, d.team2].filter(Boolean)))).sort(),
    [data]
  )

  const [season, setSeason] = useState('')
  const [team, setTeam] = useState('')
  const [stageFilter, setStageFilter] = useState<'all' | 'league' | 'playoff'>('all')

  useEffect(() => {
    if (seasons.length && !season) setSeason(seasons[0])
  }, [seasons, season])

  const filtered = useMemo(() => {
    return data.filter(d => {
      if (season && String(d.season) !== season) return false
      if (team && d.team1 !== team && d.team2 !== team) return false
      if (stageFilter === 'league' && d.playoff && String(d.playoff).trim() !== '') return false
      if (stageFilter === 'playoff' && (!d.playoff || String(d.playoff).trim() === '')) return false
      return true
    })
  }, [data, season, team, stageFilter])

  const tossAnalysis = useMemo(() => {
    const tossWinMatches = filtered.filter(m => m.toss_winner && m.winner)
    const tossAndMatch = tossWinMatches.filter(m => m.toss_winner === m.winner)
    const pct = tossWinMatches.length ? ((tossAndMatch.length / tossWinMatches.length) * 100).toFixed(1) : '—'
    const batFirst = tossWinMatches.filter(m => m.toss_decision === 'bat').length
    const fieldFirst = tossWinMatches.filter(m => m.toss_decision === 'field').length
    return { total: tossWinMatches.length, tossAndMatch: tossAndMatch.length, pct, batFirst, fieldFirst }
  }, [filtered])

  const { page, setPage, pageData, totalPages, from, to, total } = usePagination(filtered)

  if (loading) return <div className="loading"><div className="spinner" /></div>
  if (error) return <div className="error">Failed to load match data: {error}</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Matches</div>
        <div className="page-sub">Browse all {data.length} IPL matches</div>
      </div>

      <div className="filter-strip">
        <select className="select" value={season} onChange={e => setSeason(e.target.value)}>
          <option value="">All seasons</option>
          {seasons.map(s => <option key={s} value={s}>Season {s}</option>)}
        </select>
        <select className="select" value={team} onChange={e => setTeam(e.target.value)}>
          <option value="">All teams</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="toggle-strip">
          {(['all', 'league', 'playoff'] as const).map(v => (
            <button key={v} className={`toggle-btn${stageFilter === v ? ' active' : ''}`} onClick={() => setStageFilter(v)}>
              {v === 'all' ? 'All' : v === 'league' ? 'League' : 'Playoff'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
        {filtered.length} matches total
      </div>

      {/* Toss analysis */}
      {filtered.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 24px', marginBottom: 20, display: 'flex', gap: 36, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Toss Win → Match Win</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', letterSpacing: '-0.5px' }}>{tossAnalysis.pct}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Chose to Bat</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{tossAnalysis.batFirst}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Chose to Field</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>{tossAnalysis.fieldFirst}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {pageData.map((m, i) => {
          const isPlayoff = m.playoff && String(m.playoff).trim() !== ''
          return (
            <div key={`${m.id}-${i}`} className="match-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div className="teams">{m.team1} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>vs</span> {m.team2}</div>
                  <div className="winner" style={{ marginTop: 5 }}>
                    <Trophy size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    {m.winner} won
                    {m.result && m.result_margin ? ` by ${m.result_margin} ${m.result}` : m.method ? ` (${m.method})` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {isPlayoff && <span className="pill pill--amber">{String(m.playoff)}</span>}
                  <span className="pill pill--gray">S{m.season}</span>
                </div>
              </div>
              <div className="meta" style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {m.player_of_match && (
                  <span><User size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />{m.player_of_match}</span>
                )}
                {m.venue && (
                  <span><MapPin size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />{m.venue}{m.city ? `, ${m.city}` : ''}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} from={from} to={to} total={total} />
      {filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No matches found for the selected filters.</div>
      )}
    </div>
  )
}

export default Matches
