# Poker Tracker

A modern poker game score tracking app for home games. Track results, view player stats, analyze trends with charts, and manage your poker group — all in a clean, responsive UI.

![Dark Mode](https://img.shields.io/badge/theme-dark%20%2F%20light-blue)
![React](https://img.shields.io/badge/react-18-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5-3178c6)
![Vite](https://img.shields.io/badge/vite-8-646cff)

## Features

### Dashboard
- **Current King** — the player with the highest cumulative winnings, displayed prominently
- **Stats grid** — games played, active players, biggest single win, best streak
- **Standings** — top 6 players with king title badges
- **Latest game** — results from the most recent session
- **Player carousel** (mobile) — horizontal scroll-snap cards for quick player browsing

### Leaderboard
- Sortable table across 8 columns: Total, Games, Win %, Avg/Game, Kings, Streak, Best Win, Worst Loss
- Click any column header to sort ascending/descending
- Click a player name to view their full profile
- King title badges (crown icon + count) for players who've won game nights

### Player Profiles
- Individual stats grid (8 metrics)
- Cumulative earnings line chart over time
- Game-by-game result history
- Head-to-head record vs every other player

### Game History
- Chronological list of all games with date, location, king, and player count
- Expandable rows showing full results for each game
- Filter by player dropdown
- Admin: delete games

### Charts & Analytics
- **Cumulative Earnings** — multi-line chart tracking all selected players over time
- **Win Rate** — horizontal bar chart (min 3 games)
- **Games Played** — pie chart distribution
- **Monthly Performance** — stacked bar chart by month
- Player selector pills with color-coded toggle

### Add Game (Admin)
- Date picker, location, and notes fields
- Dynamic player rows — select from active players, enter results
- Real-time balance validation (should sum to $0)
- Auto-detects the game's "king" (highest winner)

### Manage Players (Admin)
- Add new players with custom color picker
- Inline edit player names and colors
- Toggle active/inactive status (inactive players hidden from Add Game dropdown)
- Delete players (only if they have 0 recorded games)

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | [React 18](https://react.dev) + [TypeScript](https://typescriptlang.org) |
| Build | [Vite 8](https://vite.dev) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + CSS custom properties |
| Charts | [Recharts](https://recharts.org) |
| Icons | [Lucide React](https://lucide.dev) |
| Gestures | [react-swipeable](https://github.com/FormidableLabs/react-swipeable) |

## Design

Inspired by [Linear](https://linear.app) and [Vercel](https://vercel.com) — minimal, monochrome zinc palette with vibrant data colors.

- **Dark mode** (default) — `#09090b` background, zinc borders, high-contrast text
- **Light mode** — `#fafafa` background, clean and airy
- **Typography** — Inter for UI, JetBrains Mono for numbers/money
- **Layout** — Grid-line dividers (1px gap technique), pill-style navigation tabs
- **Mobile** — Responsive at all breakpoints, swipe navigation between pages, dot indicators, icon-only nav

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
git clone https://github.com/razeebmahmood/poker-tracker.git
cd poker-tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Admin Access

The app has two modes:

| Mode | Access |
|------|--------|
| **Viewer** (default) | Dashboard, Leaderboard, Games (read-only), Charts, Player Profiles |
| **Admin** | Everything above + Add Game, Manage Players, Delete Games |

To unlock admin mode, click the lock icon in the top-right corner and enter the password.

**Default password:** `poker2025`

To change the password, edit `ADMIN_HASH` in `src/contexts/AdminContext.tsx`.

## Data

Game data is stored in `src/data/games.json` with this structure:

```json
{
  "players": [
    { "name": "Marcus", "color": "#F59E0B", "active": true }
  ],
  "games": [
    {
      "id": 1,
      "date": "2025-01-04",
      "results": { "Marcus": 233, "James": -197 },
      "location": "The Den",
      "notes": "",
      "king": "Marcus"
    }
  ]
}
```

- **Initial data** loads from the JSON file (read-only)
- **New games** added via the UI are saved to `localStorage`
- **Player changes** (colors, active status) are saved to `localStorage`
- To reset to defaults, clear `poker-tracker-*` keys from localStorage

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com/new](https://vercel.com/new).

### Replit

1. Import the GitHub repo on [replit.com](https://replit.com)
2. Set the run command to `npm run dev -- --host`
3. Click Run

## Project Structure

```
src/
├── App.tsx                  # Root component, routing, state, swipe handler
├── types.ts                 # TypeScript interfaces
├── index.css                # CSS variables (dark/light), global styles
├── contexts/
│   ├── ThemeContext.tsx      # Dark/light mode provider
│   └── AdminContext.tsx      # Admin authentication provider
├── data/
│   └── games.json           # Game data (34 games, 15 players)
├── utils/
│   └── stats.ts             # Stats calculations, formatters, color helpers
└── components/
    ├── Layout.tsx            # Header, nav, theme toggle, admin lock
    ├── Dashboard.tsx         # Hero grid, standings, latest game, carousel
    ├── Leaderboard.tsx       # Sortable stats table
    ├── GameHistory.tsx       # Expandable game list with filter
    ├── PlayerProfile.tsx     # Player stats, chart, head-to-head
    ├── AddGame.tsx           # New game form with validation
    ├── ManagePlayers.tsx     # Player CRUD with color picker
    ├── Charts.tsx            # 4 chart types with player selector
    └── AdminLogin.tsx        # Password modal
```

## License

MIT
