import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import ConfirmModal from './ConfirmModal'
import {
  LayoutDashboard, FlaskConical, PackagePlus, ClipboardList,
  FileText, CheckSquare, Truck, Users, LogOut, ChevronLeft, ChevronRight,
  CalendarClock, HelpCircle,
} from 'lucide-react'

const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrateur', ROLE_MAGASINIER: 'Magasinier',
  ROLE_MAJOR: 'Major', ROLE_TECHNICIEN: 'Technicien',
}

const NAV_ITEMS = [
  { to: '/dashboard',              label: 'Dashboard',      Icon: LayoutDashboard, roles: null },
  { to: '/produits',               label: 'Produits',       Icon: FlaskConical,    roles: null },
  { to: '/lots/nouveau',           label: 'Réception',      Icon: PackagePlus,     roles: ['ROLE_MAGASINIER', 'ROLE_ADMIN'] },
  { to: '/lots/peremption-proche', label: 'Péremption',     Icon: CalendarClock,   roles: ['ROLE_MAGASINIER', 'ROLE_ADMIN'] },
  { to: '/stock/historique',       label: 'Historique',     Icon: ClipboardList,   roles: null },
  { to: '/demandes',               label: 'Mes demandes',   Icon: FileText,        roles: ['ROLE_TECHNICIEN', 'ROLE_ADMIN'] },
  { to: '/demandes/validation',    label: 'Validation',     Icon: CheckSquare,     roles: ['ROLE_MAJOR', 'ROLE_ADMIN'] },
  { to: '/demandes/traitement',    label: 'Traitement',     Icon: Truck,           roles: ['ROLE_MAGASINIER', 'ROLE_ADMIN'] },
  { to: '/utilisateurs',           label: 'Utilisateurs',   Icon: Users,           roles: ['ROLE_ADMIN'] },
  { to: '/aide',                   label: 'Aide & Support',  Icon: HelpCircle,      roles: null },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logoutUser, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => setShowLogoutConfirm(true)
  const confirmLogout = () => { logoutUser(); navigate('/login') }

  const visibleItems = NAV_ITEMS.filter(item => !item.roles || hasRole(...item.roles))

  // Correspondance exacte — "/demandes" n'est jamais actif sur "/demandes/validation"
  const isActive = (to) => location.pathname === to

  const W = collapsed ? 68 : 240

  return (
    <aside style={{ ...styles.sidebar, width: W }}>

      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.brandIconWrap}>
          <FlaskConical size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div style={styles.brandText}>
            <div style={styles.brandName}>Réactifs UASZ</div>
            <div style={styles.brandSub}>Laboratoire UFR-SS</div>
          </div>
        )}
      </div>

      {/* Toggle button — déplacé dans la Topbar */}

      {/* Nav */}
      <nav style={styles.nav}>
        {visibleItems.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            style={{
              ...styles.navItem,
              justifyContent: collapsed ? 'center' : 'flex-start',
              ...(isActive(to) ? styles.navItemActive : {}),
            }}
          >
            <span style={{ ...styles.iconWrap, ...(isActive(to) ? styles.iconWrapActive : {}) }}>
              <Icon size={18} strokeWidth={1.8} />
            </span>
            {!collapsed && <span style={styles.navLabel}>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ ...styles.footer, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={styles.avatar}>{user?.prenom?.[0]}{user?.nom?.[0]}</div>
        {!collapsed && (
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.prenom} {user?.nom}</div>
            <div style={styles.userRole}>{ROLE_LABELS[user?.role]}</div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        icon="logout"
        title="Déconnexion"
        message="Voulez-vous vraiment vous déconnecter de la plateforme ?"
        confirmLabel="Se déconnecter"
        confirmColor="#e67e22"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <ConfirmModal
        isOpen={showLogoutConfirm}
        icon="logout"
        title="Déconnexion"
        message="Voulez-vous vraiment vous déconnecter de la plateforme ?"
        confirmLabel="Se déconnecter"
        confirmColor="#e67e22"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  )
}

const styles = {
  sidebar: {
    minHeight: '100vh',
    background: '#0f2744',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    zIndex: 100,
    transition: 'width 0.25s ease',
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    minHeight: 64,
  },
  brandIconWrap: {
    width: 38, height: 38, borderRadius: '50%',
    background: '#2563eb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  brandText: { overflow: 'hidden' },
  brandName: { color: '#fff', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' },
  brandSub: { color: '#6b8cae', fontSize: 11, marginTop: 2, whiteSpace: 'nowrap' },
  toggleBtn: {
    display: 'none',
  },
  nav: {
    flex: 1,
    padding: '10px 8px',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px',
    borderRadius: 10,
    color: '#8aaec8',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'background 0.15s, color 0.15s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navItemActive: {
    background: '#2563eb',
    color: '#fff',
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  iconWrapActive: {
    background: 'rgba(255,255,255,0.2)',
  },
  navLabel: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
  footer: {
    padding: '12px 8px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: '#2563eb', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { color: '#6b8cae', fontSize: 11, marginTop: 1 },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    color: '#8aaec8',
    width: 34, height: 34,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },
}
