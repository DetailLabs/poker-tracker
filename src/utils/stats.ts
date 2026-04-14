import type { Game, PlayerStats, PlayerInfo } from '../types'

export function getPlayerStats(games: Game[], playerName: string): PlayerStats {
  const playerGames = games.filter(g => playerName in g.results)
  const results = playerGames.map(g => g.results[playerName])
  const wins = results.filter(r => r > 0)
  const losses = results.filter(r => r < 0)

  let bestStreak = 0, currentStreak = 0
  for (const r of results) {
    if (r > 0) { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak) }
    else { currentStreak = 0 }
  }

  return {
    name: playerName,
    totalWinnings: results.reduce((a, b) => a + b, 0),
    gamesPlayed: playerGames.length,
    winningGames: wins.length,
    winRate: playerGames.length > 0 ? wins.length / playerGames.length : 0,
    avgPerGame: playerGames.length > 0 ? results.reduce((a, b) => a + b, 0) / playerGames.length : 0,
    kingTitles: games.filter(g => g.king === playerName).length,
    bestStreak,
    biggestWin: wins.length > 0 ? Math.max(...wins) : 0,
    biggestLoss: losses.length > 0 ? Math.min(...losses) : 0,
    losingGames: losses.length,
  }
}

export function getAllPlayerStats(games: Game[], players: PlayerInfo[]): PlayerStats[] {
  return players
    .map(p => getPlayerStats(games, p.name))
    .filter(s => s.gamesPlayed > 0)
    .sort((a, b) => b.totalWinnings - a.totalWinnings)
}

export function getCumulativeData(games: Game[], playerNames: string[]) {
  const sorted = [...games].sort((a, b) => a.date.localeCompare(b.date))
  const cumulative: Record<string, number> = {}
  return sorted.map(g => {
    const point: Record<string, number | string> = { date: g.date, game: `#${g.id}` }
    for (const p of playerNames) {
      if (p in g.results) cumulative[p] = (cumulative[p] || 0) + g.results[p]
      if (cumulative[p] !== undefined) point[p] = Math.round(cumulative[p] * 100) / 100
    }
    return point
  })
}

export function formatMoney(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toFixed(n % 1 === 0 ? 0 : 1)}`
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function moneyClass(n: number): string {
  if (n > 0) return 'positive'
  if (n < 0) return 'negative'
  return ''
}

export function getPlayerColor(name: string, players: PlayerInfo[]): string {
  const p = players.find(pl => pl.name === name)
  return p?.color || '#94a3b8'
}

export function playerGamesCount(games: Game[], playerName: string): number {
  return games.filter(g => playerName in g.results).length
}
