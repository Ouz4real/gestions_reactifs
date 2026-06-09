import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrateur',
  ROLE_MAGASINIER: 'Magasinier',
  ROLE_MAJOR: 'Major',
  ROLE_TECHNICIEN: 'Technicien',
}

export default function Navbar() {
  const { user, logoutUser, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/dashboard" style={styles.brandLink}>🧪 Réactifs UASZ</Link>
      </div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/produits" style={styles.link}>Produits</Link>
        {hasRole('ROLE_MAGASINIER', 'ROLE_ADMIN') && (
          <Link to="/lots/nouveau" style={styles.link}>Réception</Link>
        )}
        <Link to="/stock/historique" style={styles.link}>Historique</Link>
        {hasRole('ROLE_TECHNICIEN', 'ROLE_MAJOR') && (
          <Link to="/demandes" style={styles.link}>Demandes</Link>
        )}
        {hasRole('ROLE_MAJOR', 'ROLE_ADMIN') && (
          <Link to="/validation" style={styles.link}>Validation</Link>
        )}
        {hasRole('ROLE_MAGASINIER', 'ROLE_ADMIN') && (
          <Link to="/demandes/traitement" style={styles.link}>Traitement</Link>
        )}
        {hasRole('ROLE_ADMIN') && (
          <Link to="/utilisateurs" style={styles.link}>Utilisateurs</Link>
        )}
      </div>
      <div style={styles.user}>
        <span style={styles.userInfo}>
          {user?.prenom} {user?.nom} — {ROLE_LABELS[user?.role]}
        </span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'0 24px', height:56, background:'#1a3c5e', color:'#fff' },
  brand: { fontWeight:700, fontSize:18 },
  brandLink: { color:'#fff', textDecoration:'none' },
  links: { display:'flex', gap:16 },
  link: { color:'#cce0f5', textDecoration:'none', fontSize:14, fontWeight:500 },
  user: { display:'flex', alignItems:'center', gap:12 },
  userInfo: { fontSize:13, color:'#aac8e8' },
  logoutBtn: { background:'#e74c3c', color:'#fff', border:'none',
    borderRadius:4, padding:'6px 12px', cursor:'pointer', fontSize:13 },
}
