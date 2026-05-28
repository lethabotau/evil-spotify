import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { CorruptionProvider } from './context/CorruptionContext'
import './global.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CorruptionProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </CorruptionProvider>
  </StrictMode>,
)
