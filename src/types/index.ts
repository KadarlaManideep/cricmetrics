export interface BattingCSV {
  batsman: string;
  runs: number;
  deliveries_faced: number;
  outs: number;
  dots: number;
  singles: number;
  doubles: number;
  threes: number;
  fours: number;
  sixers: number;
  bowled: number;
  catches: number;
  run_outs: number;
}

export interface BowlingCSV {
  bowler: string;
  runs_allowed: number;
  extras_allowed: number;
  deliveries_bowled: number;
  extra_deliveries: number;
  wickets_taken: number;
  dots: number;
  singles: number;
  doubles: number;
  threes: number;
  fours: number;
  sixers: number;
  bowl_outs: number;
}

export interface MatchStatsCSV {
  season: string | number;
  eliminator: string;
  id: string;
  inning: number;
  batting_team: string;
  bowling_team: string;
  runs: number;
  extras: number;
  deliveries: number;
  wickets: number;
  dots: number;
  singles: number;
  doubles: number;
  threes: number;
  fours: number;
  sixers: number;
  extra_deliveries: number;
  bowled: number;
  catches: number;
  run_outs: number;
}

export interface MatchSummaryCSV {
  id: string;
  city: string;
  season: string | number;
  player_of_match: string;
  venue: string;
  neutral_venue: string;
  team1: string;
  team2: string;
  toss_winner: string;
  toss_decision: string;
  winner: string;
  result: string;
  result_margin: string;
  playoff: string;
  method: string;
  umpire1: string;
  umpire2: string;
}

export interface PointsTableCSV {
  season: string | number;
  rank: number;
  name: string;
  short_name: string;
  played: number;
  won: number;
  lost: number;
  noresult: number;
  points: number;
  nrr: number;
}

export interface TeamLeagueCSV {
  season: string | number;
  team: string;
  runs_scored: number;
  deliveries_faced: number;
  wickets_lost: number;
  dots: number;
  singles: number;
  doubles: number;
  threes: number;
  fours: number;
  sixers: number;
  bowled_out: number;
  catch_out: number;
  run_outs: number;
  runs_allowed: number;
  deliveries_bowled: number;
  wickets_taken: number;
  dots_allowed: number;
  singles_allowed: number;
  doubles_allowed: number;
  threes_allowed: number;
  fours_allowed: number;
  sixers_allowed: number;
  bowl_out_taken: number;
  catch_taken: number;
  run_outs_taken: number;
}

export interface TeamPlayoffCSV extends TeamLeagueCSV {}
