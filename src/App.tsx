import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AuthGuard } from './components/AuthGuard'
import { About } from './pages/About'
import { Album } from './pages/Album'
import { Artist } from './pages/Artist'
import { Callback } from './pages/Callback'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { Login } from './pages/Login'
import { Playlist } from './pages/Playlist'
import { Search } from './pages/Search'

function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="callback" element={<Callback />} />
      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="playlist/:id" element={<Playlist />} />
          <Route path="album/:id" element={<Album />} />
          <Route path="artist/:id" element={<Artist />} />
          <Route path="about" element={<About />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
