import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function PrivateRoute({ children, roles }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  // Pas de restriction de rôle → accès libre
  if (!roles) return children

  // Admin passe toujours
  if (user.role === 'ROLE_ADMIN') return children

  // Vérification du rôle
  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
