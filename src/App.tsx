import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AuthGuard } from './components/AuthGuard'
import { OAuthCallbackHandler } from './components/OAuthCallbackHandler'
import { About } from './pages/About'
import { Album } from './pages/Album'
import { Artist } from './pages/Artist'
import { Callback } from './pages/Callback'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Playlist } from './pages/Playlist'
function App() {
  return (
    <>
      <OAuthCallbackHandler />
      <Routes>
      <Route path="login" element={<Login />} />
      <Route path="callback" element={<Callback />} />
      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="playlist/:id" element={<Playlist />} />
          <Route path="album/:id" element={<Album />} />
          <Route path="artist/:id" element={<Artist />} />
          <Route path="about" element={<About />} />
        </Route>
      </Route>
      </Routes>
    </>
  )
}

export default App
