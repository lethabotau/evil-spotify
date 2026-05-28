import { Outlet } from 'react-router-dom'
import { PlaybackBar } from './PlaybackBar'
import { Sidebar } from './Sidebar'
import './app-layout.css'

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
      <PlaybackBar />
    </div>
  )
}
