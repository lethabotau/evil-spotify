import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CorruptionProvider } from './context/CorruptionContext'
import './global.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CorruptionProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CorruptionProvider>
  </StrictMode>,
)
