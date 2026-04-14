import type { ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import './index.css'
import { WalletProvider, useWallet } from './context/WalletContext'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Dungeons = lazy(() => import('./pages/Dungeons'))
const Arena = lazy(() => import('./pages/Arena'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Marketplace = lazy(() => import('./pages/Marketplace'))
const Shop = lazy(() => import('./pages/Shop'))
const Settings = lazy(() => import('./pages/Settings'))
const CharacterCreation = lazy(() => import('./pages/CharacterCreation'))
const SlotMachine = lazy(() => import('./pages/SlotMachine'))
const PrizeWheel = lazy(() => import('./pages/PrizeWheel'))

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useWallet()
  return isConnected ? <>{children}</> : <Navigate to="/" replace />
}

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
    <div className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900/90 px-10 py-8 text-center shadow-xl">
      <p className="text-lg font-semibold">Loading VaultCrawler...</p>
      <p className="mt-2 text-sm text-slate-400">Preparing your game experience.</p>
    </div>
  </div>
)

function AppContent() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-character"
          element={
            <ProtectedRoute>
              <CharacterCreation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dungeons"
          element={
            <ProtectedRoute>
              <Dungeons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/arena"
          element={
            <ProtectedRoute>
              <Arena />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/slot-machine"
          element={
            <ProtectedRoute>
              <SlotMachine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prize-wheel"
          element={
            <ProtectedRoute>
              <PrizeWheel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <Router>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </Router>
  )
}

export default App
