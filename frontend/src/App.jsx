import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './auth/AuthContext'
import PrivateRoute from './auth/PrivateRoute'
import ErrorBoundary from './components/ErrorBoundary'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Produits from './pages/Produits'
import ProduitDetail from './pages/ProduitDetail'
import NouveauLot from './pages/NouveauLot'
import Historique from './pages/Historique'
import Demandes from './pages/Demandes'
import ValidationDemandes from './pages/ValidationDemandes'
import TraitementDemandes from './pages/TraitementDemandes'
import Utilisateurs from './pages/Utilisateurs'
import LotsPeremption from './pages/LotsPeremption'
import Aide from './pages/Aide'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
})

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/produits" element={
              <PrivateRoute><Produits /></PrivateRoute>
            } />
            <Route path="/produits/:id" element={
              <PrivateRoute><ProduitDetail /></PrivateRoute>
            } />
            <Route path="/lots/nouveau" element={
              <PrivateRoute roles={['ROLE_MAGASINIER', 'ROLE_ADMIN']}>
                <NouveauLot />
              </PrivateRoute>
            } />
            <Route path="/lots/peremption-proche" element={
              <PrivateRoute><LotsPeremption /></PrivateRoute>
            } />
            <Route path="/stock/historique" element={
              <PrivateRoute><Historique /></PrivateRoute>
            } />
            <Route path="/demandes" element={
              <PrivateRoute roles={['ROLE_TECHNICIEN', 'ROLE_ADMIN']}>
                <Demandes />
              </PrivateRoute>
            } />
            <Route path="/demandes/validation" element={
              <PrivateRoute roles={['ROLE_MAJOR', 'ROLE_ADMIN']}>
                <ValidationDemandes />
              </PrivateRoute>
            } />
            <Route path="/demandes/traitement" element={
              <PrivateRoute roles={['ROLE_MAGASINIER', 'ROLE_ADMIN']}>
                <TraitementDemandes />
              </PrivateRoute>
            } />
            <Route path="/utilisateurs" element={
              <PrivateRoute roles={['ROLE_ADMIN']}>
                <Utilisateurs />
              </PrivateRoute>
            } />
            <Route path="/aide" element={
              <PrivateRoute><Aide /></PrivateRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
