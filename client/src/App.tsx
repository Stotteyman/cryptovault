import type { ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import './index.css'
import { useAuth } from './context/AuthContext'
import { AuthProvider } from './context/AuthContext'
import { WalletProvider, useWallet } from './context/WalletContext'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Dungeons = lazy(() => import('./pages/Dungeons'))
const Arena = lazy(() => import('./pages/Arena'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Characters = lazy(() => import('./pages/Characters'))
const CharacterDetails = lazy(() => import('./pages/CharacterDetails'))
const Marketplace = lazy(() => import('./pages/Marketplace'))
const Shop = lazy(() => import('./pages/Shop'))
const Settings = lazy(() => import('./pages/Settings'))
const CharacterCreation = lazy(() => import('./pages/CharacterCreation'))
const SlotMachine = lazy(() => import('./pages/SlotMachine'))
const PrizeWheel = lazy(() => import('./pages/PrizeWheel'))
const AddVT = lazy(() => import('./pages/AddVT'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const Disclaimer = lazy(() => import('./pages/Disclaimer'))

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isConnected: walletConnected } = useWallet()
  const { isConnected: authConnected, initializing } = useAuth()

  if (initializing) {
    return <LoadingFallback />
  }

  return walletConnected || authConnected ? <>{children}</> : <Navigate to="/" replace />
}

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isConnected: walletConnected } = useWallet()
  const { isConnected: authConnected, initializing } = useAuth()

  if (initializing) {
    return <LoadingFallback />
  }

  return walletConnected || authConnected ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
    <div className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900/90 px-10 py-8 text-center shadow-xl">
      <p className="text-lg font-semibold">Loading Vault Crawler...</p>
      <p className="mt-2 text-sm text-slate-400">Preparing your game experience.</p>
    </div>
  </div>
)

function AppContent() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
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
          path="/characters"
          element={
            <ProtectedRoute>
              <Characters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/characters/:characterId"
          element={
            <ProtectedRoute>
              <CharacterDetails />
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
          path="/add-vt"
          element={
            <ProtectedRoute>
              <AddVT />
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
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
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
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </WalletProvider>
    </Router>
  )
}

export default App
