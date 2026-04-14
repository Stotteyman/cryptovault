import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Dashboard from './pages/Dashboard'
import Dungeons from './pages/Dungeons'
import Arena from './pages/Arena'
import Inventory from './pages/Inventory'
import Marketplace from './pages/Marketplace'
import Shop from './pages/Shop'
import Login from './pages/Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dungeons" element={<Dungeons />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
    </Router>
  )
}

export default App
