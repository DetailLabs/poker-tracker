export interface Game {
  id: number
  date: string
  results: Record<string, number>
  location: string
  notes: string
  king: string
}

export interface PlayerInfo {
  name: string
  color: string
  active: boolean
}

export interface GameData {
  players: PlayerInfo[]
  games: Game[]
}

export interface PlayerStats {
  name: string
  totalWinnings: number
  gamesPlayed: number
  winningGames: number
  winRate: number
  avgPerGame: number
  kingTitles: number
  bestStreak: number
  biggestWin: number
  biggestLoss: number
  losingGames: number
}

export interface DateRange {
  from: string
  to: string
}

export type Page =
  | { type: 'dashboard' }
  | { type: 'leaderboard' }
  | { type: 'history' }
  | { type: 'player'; name: string }
  | { type: 'addGame' }
  | { type: 'charts' }
  | { type: 'managePlayers' }
