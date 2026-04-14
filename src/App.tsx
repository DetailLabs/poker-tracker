import { useState, useEffect } from 'react'
import type { Page, Game, GameData, PlayerInfo } from './types'
import { ThemeProvider } from './contexts/ThemeContext'
import { AdminProvider } from './contexts/AdminContext'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { Leaderboard } from './components/Leaderboard'
import { GameHistory } from './components/GameHistory'
import { PlayerProfile } from './components/PlayerProfile'
import { AddGame } from './components/AddGame'
import { Charts } from './components/Charts'
import { ManagePlayers } from './components/ManagePlayers'
import initialData from './data/games.json'
import { useSwipeable } from 'react-swipeable'

const STORAGE_KEY = 'poker-tracker-extra-games'
const PLAYERS_KEY = 'poker-tracker-players'

const PAGE_ORDER: Page['type'][] = ['dashboard', 'leaderboard', 'history', 'charts']

function loadData(): GameData {
  const base = initialData as GameData
  let players = base.players
  try {
    const savedPlayers = localStorage.getItem(PLAYERS_KEY)
    if (savedPlayers) players = JSON.parse(savedPlayers)
  } catch {}

  let games = base.games
  try {
    const extra = localStorage.getItem(STORAGE_KEY)
    if (extra) {
      const extraGames: Game[] = JSON.parse(extra)
      games = [...base.games, ...extraGames]
    }
  } catch {}

  // Ensure all players from games exist in players list
  const playerNames = new Set(players.map(p => p.name))
  for (const g of games) {
    for (const name of Object.keys(g.results)) {
      if (!playerNames.has(name)) {
        players.push({ name, color: '#94a3b8', active: true })
        playerNames.add(name)
      }
    }
  }

  return { players, games }
}

function AppContent() {
  const [page, setPage] = useState<Page>({ type: 'dashboard' })
  const [data, setData] = useState<GameData>(loadData)

  useEffect(() => {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(data.players))
    const baseIds = new Set((initialData as GameData).games.map(g => g.id))
    const extraGames = data.games.filter(g => !baseIds.has(g.id))
    if (extraGames.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(extraGames))
    }
  }, [data])

  function handleAddGame(game: Game) {
    setData(prev => {
      const newPlayerNames = Object.keys(game.results)
      const existingNames = new Set(prev.players.map(p => p.name))
      const newPlayers = newPlayerNames
        .filter(n => !existingNames.has(n))
        .map(n => ({ name: n, color: '#94a3b8', active: true }))
      return { players: [...prev.players, ...newPlayers], games: [...prev.games, game] }
    })
  }

  function handleDeleteGame(gameId: number) {
    setData(prev => ({ ...prev, games: prev.games.filter(g => g.id !== gameId) }))
  }

  function handleUpdatePlayers(players: PlayerInfo[]) {
    setData(prev => ({ ...prev, players }))
  }

  // Swipe navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIdx = PAGE_ORDER.indexOf(page.type)
      if (currentIdx >= 0 && currentIdx < PAGE_ORDER.length - 1) {
        setPage({ type: PAGE_ORDER[currentIdx + 1] } as Page)
      }
    },
    onSwipedRight: () => {
      const currentIdx = PAGE_ORDER.indexOf(page.type)
      if (currentIdx > 0) {
        setPage({ type: PAGE_ORDER[currentIdx - 1] } as Page)
      }
    },
    trackMouse: false,
    delta: 50,
  })

  function renderPage() {
    switch (page.type) {
      case 'dashboard':
        return <Dashboard games={data.games} players={data.players} onNavigate={setPage} />
      case 'leaderboard':
        return <Leaderboard games={data.games} players={data.players} onNavigate={setPage} />
      case 'history':
        return <GameHistory games={data.games} players={data.players} onNavigate={setPage} onDeleteGame={handleDeleteGame} />
      case 'player':
        return <PlayerProfile games={data.games} players={data.players} playerName={page.name} onNavigate={setPage} />
      case 'addGame':
        return <AddGame games={data.games} players={data.players} onAddGame={handleAddGame} />
      case 'charts':
        return <Charts games={data.games} players={data.players} />
      case 'managePlayers':
        return <ManagePlayers games={data.games} players={data.players} onUpdatePlayers={handleUpdatePlayers} />
    }
  }

  const pageIdx = PAGE_ORDER.indexOf(page.type)

  return (
    <Layout page={page} onNavigate={setPage}>
      <div {...swipeHandlers}>
        {renderPage()}
      </div>
      {/* Mobile dot indicators */}
      {pageIdx >= 0 && (
        <div className="flex justify-center gap-1.5 py-4 sm:hidden">
          {PAGE_ORDER.map((t, i) => (
            <div key={t} className={`dot-indicator ${i === pageIdx ? 'active' : ''}`} />
          ))}
        </div>
      )}
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </ThemeProvider>
  )
}

export default App
