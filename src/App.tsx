import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { Callback } from './pages/Callback'
import { Home } from './pages/Home'
import { Login } from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="callback" element={<Callback />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}

export default App
