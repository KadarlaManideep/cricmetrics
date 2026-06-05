import type { BattingCSV, BowlingCSV } from '../types';

export function battingAverage(runs: number, outs: number): string {
  if (!outs) return 'N/A';
  return (runs / outs).toFixed(1);
}

export function strikeRate(runs: number, deliveries: number): string {
  if (!deliveries) return '0.0';
  return ((runs / deliveries) * 100).toFixed(1);
}

export function boundaryPercent(fours: number, sixers: number, deliveries: number): string {
  if (!deliveries) return '0.0';
  return (((fours + sixers) / deliveries) * 100).toFixed(1);
}

export function dotBallPercentBatting(dots: number, deliveries: number): string {
  if (!deliveries) return '0.0';
  return ((dots / deliveries) * 100).toFixed(1);
}

export function economy(runsAllowed: number, deliveriesBowled: number): string {
  if (!deliveriesBowled) return '0.0';
  return ((runsAllowed / deliveriesBowled) * 6).toFixed(1);
}

export function bowlingAverage(runsAllowed: number, wickets: number): string {
  if (!wickets) return 'N/A';
  return (runsAllowed / wickets).toFixed(1);
}

export function dotBallPercentBowling(dots: number, deliveries: number): string {
  if (!deliveries) return '0.0';
  return ((dots / deliveries) * 100).toFixed(1);
}

// helpers to map CSV rows to numeric defaults
export function safeNum(v: any): number {
  if (v === null || v === undefined || v === '') return 0;
  return Number(v) || 0;
}

export function mapBatting(row: Partial<BattingCSV>): BattingCSV {
  return {
    batsman: String(row.batsman || ''),
    runs: safeNum(row.runs),
    deliveries_faced: safeNum(row.deliveries_faced),
    outs: safeNum(row.outs),
    dots: safeNum(row.dots),
    singles: safeNum(row.singles),
    doubles: safeNum(row.doubles),
    threes: safeNum(row.threes),
    fours: safeNum(row.fours),
    sixers: safeNum(row.sixers),
    bowled: safeNum(row.bowled),
    catches: safeNum(row.catches),
    run_outs: safeNum(row.run_outs),
  };
}

export function mapBowling(row: Partial<BowlingCSV>): BowlingCSV {
  return {
    bowler: String(row.bowler || ''),
    runs_allowed: safeNum(row.runs_allowed),
    extras_allowed: safeNum(row.extras_allowed),
    deliveries_bowled: safeNum(row.deliveries_bowled),
    extra_deliveries: safeNum(row.extra_deliveries),
    wickets_taken: safeNum(row.wickets_taken),
    dots: safeNum(row.dots),
    singles: safeNum(row.singles),
    doubles: safeNum(row.doubles),
    threes: safeNum(row.threes),
    fours: safeNum(row.fours),
    sixers: safeNum(row.sixers),
    bowl_outs: safeNum(row.bowl_outs),
  };
}
