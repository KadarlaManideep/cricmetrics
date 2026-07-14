import { useMemo } from 'react'
import useCSV from './useCSV'
import type {
  BattingCSV,
  BowlingCSV,
  MatchSummaryCSV,
  PointsTableCSV,
  TeamLeagueCSV
} from '../types'

export const useChatData = () => {
  const { data: batting } = useCSV<BattingCSV>('ipl_player_batting_stats.csv')
  const { data: bowling } = useCSV<BowlingCSV>('ipl_player_bowling_stats.csv')
  const { data: matches } = useCSV<MatchSummaryCSV>('ipl_match_summary.csv')
  const { data: points } = useCSV<PointsTableCSV>('points_table.csv')
  const { data: teamLeague } = useCSV<TeamLeagueCSV>('team_league_stats.csv')

  const topBatsmen = useMemo(() =>
    [...batting]
      .sort((a, b) => Number(b.runs) - Number(a.runs))
      .slice(0, 30)
      .map(p => `${p.batsman}: ${p.runs} runs, SR ${p.deliveries_faced ? ((Number(p.runs) / Number(p.deliveries_faced)) * 100).toFixed(1) : 'N/A'}, ${p.fours} 4s, ${p.sixers} 6s, ${p.outs} outs`)
      .join('\n'),
    [batting]
  )

  const topBowlers = useMemo(() =>
    [...bowling]
      .sort((a, b) => Number(b.wickets_taken) - Number(a.wickets_taken))
      .slice(0, 30)
      .map(p => `${p.bowler}: ${p.wickets_taken} wkts, ${p.deliveries_bowled} balls, economy ${p.deliveries_bowled ? ((Number(p.runs_allowed) / Number(p.deliveries_bowled)) * 6).toFixed(2) : 'N/A'}`)
      .join('\n'),
    [bowling]
  )

  const potmCounts = useMemo(() => {
    const map: Record<string, number> = {}
    matches.forEach(m => {
      if (m.player_of_match) map[m.player_of_match] = (map[m.player_of_match] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => `${name}: ${count} awards`)
      .join('\n')
  }, [matches])

  const teamWins = useMemo(() => {
    const map: Record<string, number> = {}
    matches.forEach(m => {
      if (m.winner) map[m.winner] = (map[m.winner] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([team, wins]) => `${team}: ${wins} wins`)
      .join('\n')
  }, [matches])

  const recentMatches = useMemo(() =>
    [...matches]
      .filter(m => Number(m.season) >= 2022)
      .slice(0, 50)
      .map(m => `${m.season}: ${m.team1} vs ${m.team2} → ${m.winner} won${m.result_margin ? ` by ${m.result_margin} ${m.result}` : ''}, POTM: ${m.player_of_match || 'N/A'}`)
      .join('\n'),
    [matches]
  )

  // suppress unused warning — available for future context sections
  void points
  void teamLeague

  const getContext = (question: string): string => {
    const q = question.toLowerCase()

    const sections: string[] = []

    const wantsBatting = q.includes('run') || q.includes('bat') || q.includes('score') || q.includes('century') || q.includes('fifty') || q.includes('six') || q.includes('four') || q.includes('strike rate') || q.includes('average')
    const wantsBowling = q.includes('wicket') || q.includes('bowl') || q.includes('economy') || q.includes('dot') || q.includes('maiden')
    const wantsPOTM = q.includes('player of the match') || q.includes('potm') || q.includes('award') || q.includes('man of the match')
    const wantsTeam = q.includes('team') || q.includes('win') || q.includes('franchise') || q.includes('csk') || q.includes('mi ') || q.includes('rcb') || q.includes('kkr') || q.includes('srh') || q.includes('dc ') || q.includes('rr ') || q.includes('pbks') || q.includes('gt ') || q.includes('lsg')
    const wantsRecent = q.includes('2024') || q.includes('2025') || q.includes('recent') || q.includes('last season') || q.includes('latest')
    const wantsH2H = q.includes('vs') || q.includes('versus') || q.includes('against') || q.includes('head to head') || q.includes('rivalry')

    if (wantsBatting || (!wantsBowling && !wantsPOTM && !wantsTeam)) {
      sections.push(`TOP 30 BATSMEN (career):\n${topBatsmen}`)
    }

    if (wantsBowling) {
      sections.push(`TOP 30 BOWLERS (career):\n${topBowlers}`)
    }

    if (wantsPOTM) {
      sections.push(`PLAYER OF THE MATCH AWARDS:\n${potmCounts}`)
    }

    if (wantsTeam) {
      sections.push(`TEAM ALL-TIME WINS:\n${teamWins}`)
    }

    if (wantsRecent) {
      sections.push(`RECENT MATCHES (2022-2025):\n${recentMatches}`)
    }

    if (wantsH2H) {
      sections.push(`TEAM ALL-TIME WINS:\n${teamWins}`)
      sections.push(`RECENT MATCHES:\n${recentMatches}`)
    }

    if (sections.length === 0) {
      sections.push(`TOP 30 BATSMEN:\n${topBatsmen}`)
      sections.push(`TOP 30 BOWLERS:\n${topBowlers}`)
      sections.push(`TEAM WINS:\n${teamWins}`)
    }

    return sections.join('\n\n')
  }

  return { getContext }
}
