import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  Bell, Settings, User, LogOut, X,
  AlertTriangle, CalendarClock, CheckCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { getAlertes } from '../api/stock'
import { updateProfil } from '../api/auth'
import ConfirmModal from './ConfirmModal'
import ErrorMsg from './ErrorMsg'

const ROUTE_LABELS = {
  '/dashboard':              'Dashboard',
  '/produits':               'Produits',
  '/lots/nouveau':           'Réception',
  '/lots/peremption-proche': 'Péremption',
  '/stock/historique':       'Historique',
  '/demandes':               'Mes demandes',
  '/demandes/validation':    'Validation',
  '/demandes/traitement':    'Traitement',
  '/utilisateurs':           'Utilisateurs',
  '/aide':                   'Aide & Support',
}

const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrateur', ROLE_MAGASINIER: 'Magasinier',
  ROLE_MAJOR: 'Major', ROLE_TECHNICIEN: 'Technicien',
}

export default function Topbar({ collapsed, onToggle }) {
  const { user, loginUser, logoutUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [showNotif, setShowNotif]       = useState(false)
  const [showProfil, setShowProfil]     = useState(false)
  const [showProfilModal, setShowProfilModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [profilError, setProfilError]   = useState(null)
  const [profilSuccess, setProfilSuccess] = useState(false)

  const notifRef  = useRef(null)
  const profilRef = useRef(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))  setShowNotif(false)
      if (profilRef.current && !profilRef.current.contains(e.target)) setShowProfil(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { data: alertes } = useQuery({
    queryKey: ['alertes'],
    queryFn: () => getAlertes().then(r => r.data),
    refetchInterval: 60000, // rafraîchit toutes les minutes
  })

  const totalAlertes =
    (alertes?.produitsEnAlerte?.length ?? 0) +
    (alertes?.lotsPerimantBientot?.length ?? 0)

  const profilMutation = useMutation({
    mutationFn: updateProfil,
    onSuccess: (res) => {
      // Mettre à jour l'utilisateur dans le contexte
      const token = localStorage.getItem('token')
      loginUser(res.data, token)
      setProfilSuccess(true)
      setTimeout(() => { setProfilSuccess(false); setShowProfilModal(false) }, 1500)
    },
    onError: setProfilError,
  })

  const openProfilModal = () => {
    reset({
      nom: user?.nom,
      prenom: user?.prenom,
      email: user?.email,
      ancienMotDePasse: '',
      nouveauMotDePasse: '',
    })
    setProfilError(null)
    setProfilSuccess(false)
    setShowProfil(false)
    setShowProfilModal(true)
  }

  const pageTitle = ROUTE_LABELS[location.pathname] || ''

  return (
    <>
      <header style={styles.topbar}>
        {/* Toggle sidebar + Titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onToggle}
            style={styles.toggleBtn}
            title={collapsed ? 'Ouvrir la sidebar' : 'Réduire la sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <h1 style={styles.pageTitle}>{pageTitle}</h1>
        </div>

        {/* Actions droite */}
        <div style={styles.actions}>

          {/* ── Notifications ── */}
          <div style={styles.iconWrap} ref={notifRef}>
            <button
              style={styles.iconBtn}
              onClick={() => { setShowNotif(v => !v); setShowProfil(false) }}
              title="Notifications"
            >
              <Bell size={18} />
              {totalAlertes > 0 && (
                <span style={styles.badge}>{totalAlertes}</span>
              )}
            </button>

            {showNotif && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <span style={styles.dropdownTitle}>Notifications</span>
                  {totalAlertes > 0 && (
                    <span style={styles.badgeInline}>{totalAlertes}</span>
                  )}
                </div>

                {totalAlertes === 0 && (
                  <div style={styles.emptyNotif}>
                    <CheckCircle size={28} color="#27ae60" />
                    <p>Aucune alerte active</p>
                  </div>
                )}

                {alertes?.produitsEnAlerte?.length > 0 && (
                  <div style={styles.notifGroup}>
                    <div style={styles.notifGroupTitle}>
                      <AlertTriangle size={13} color="#e74c3c" /> Stock faible
                    </div>
                    {alertes.produitsEnAlerte.slice(0, 4).map(p => (
                      <button
                        key={p.id}
                        style={styles.notifItem}
                        onClick={() => { navigate(`/produits/${p.id}`); setShowNotif(false) }}
                      >
                        <span style={styles.notifDot('#e74c3c')} />
                        <span>{p.nom}</span>
                        <span style={{ color: '#e74c3c', fontWeight: 700, marginLeft: 'auto' }}>
                          {p.stockTotal} {p.unite}
                        </span>
                      </button>
                    ))}
                    {alertes.produitsEnAlerte.length > 4 && (
                      <button style={styles.notifMore}
                        onClick={() => { navigate('/produits'); setShowNotif(false) }}>
                        +{alertes.produitsEnAlerte.length - 4} autres → Voir tout
                      </button>
                    )}
                  </div>
                )}

                {alertes?.lotsPerimantBientot?.length > 0 && (
                  <div style={styles.notifGroup}>
                    <div style={styles.notifGroupTitle}>
                      <CalendarClock size={13} color="#e67e22" /> Péremption proche
                    </div>
                    {alertes.lotsPerimantBientot.slice(0, 4).map(l => (
                      <button
                        key={l.id}
                        style={styles.notifItem}
                        onClick={() => { navigate('/lots/peremption-proche'); setShowNotif(false) }}
                      >
                        <span style={styles.notifDot('#e67e22')} />
                        <span>{l.produitNom}</span>
                        <span style={{ color: '#e67e22', fontSize: 12, marginLeft: 'auto' }}>
                          {l.datePeremption}
                        </span>
                      </button>
                    ))}
                    {alertes.lotsPerimantBientot.length > 4 && (
                      <button style={styles.notifMore}
                        onClick={() => { navigate('/lots/peremption-proche'); setShowNotif(false) }}>
                        +{alertes.lotsPerimantBientot.length - 4} autres → Voir tout
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Profil / Engrenage ── */}
          <div style={styles.iconWrap} ref={profilRef}>
            <button
              style={{ ...styles.iconBtn, gap: 8 }}
              onClick={() => { setShowProfil(v => !v); setShowNotif(false) }}
              title="Mon profil"
            >
              <div style={styles.avatar}>
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <Settings size={15} color="#888" />
            </button>

            {showProfil && (
              <div style={{ ...styles.dropdown, right: 0, width: 220 }}>
                <div style={styles.profilHeader}>
                  <div style={{ ...styles.avatar, width: 42, height: 42, fontSize: 15 }}>
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </div>
                  <div>
                    <div style={styles.profilName}>{user?.prenom} {user?.nom}</div>
                    <div style={styles.profilRole}>{ROLE_LABELS[user?.role]}</div>
                  </div>
                </div>

                <div style={styles.dropdownDivider} />

                <button style={styles.dropdownItem} onClick={openProfilModal}>
                  <User size={15} /> Mon profil
                </button>
                <button
                  style={{ ...styles.dropdownItem, color: '#e74c3c' }}
                  onClick={() => { setShowProfil(false); setShowLogoutConfirm(true) }}
                >
                  <LogOut size={15} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Modal Profil ── */}
      {showProfilModal && (
        <div style={styles.overlay} onClick={() => setShowProfilModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Mon profil</h3>
              <button style={styles.closeBtn} onClick={() => setShowProfilModal(false)}>
                <X size={18} />
              </button>
            </div>

            {profilError && <ErrorMsg error={profilError} />}
            {profilSuccess && (
              <div style={styles.successMsg}>
                <CheckCircle size={16} color="#27ae60" /> Profil mis à jour avec succès
              </div>
            )}

            <form onSubmit={handleSubmit(d => profilMutation.mutate(d))}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Nom *">
                  <input style={styles.input} {...register('nom', { required: true })} />
                </Field>
                <Field label="Prénom *">
                  <input style={styles.input} {...register('prenom', { required: true })} />
                </Field>
              </div>
              <Field label="Email *">
                <input style={styles.input} type="email" {...register('email', { required: true })} />
              </Field>

              <div style={styles.separator}>
                <span style={styles.separatorText}>Changer le mot de passe (optionnel)</span>
              </div>

              <Field label="Ancien mot de passe">
                <input style={styles.input} type="password" {...register('ancienMotDePasse')}
                  placeholder="Requis pour changer le mot de passe" />
              </Field>
              <Field label="Nouveau mot de passe">
                <input style={styles.input} type="password" {...register('nouveauMotDePasse')}
                  placeholder="Laisser vide pour ne pas changer" />
              </Field>

              <div style={styles.modalActions}>
                <button type="button" style={styles.btnSecondary}
                  onClick={() => setShowProfilModal(false)}>Annuler</button>
                <button type="submit" style={styles.btnPrimary}
                  disabled={profilMutation.isPending}>
                  {profilMutation.isPending ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation déconnexion ── */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        icon="logout"
        title="Déconnexion"
        message="Voulez-vous vraiment vous déconnecter ?"
        confirmLabel="Se déconnecter"
        confirmColor="#e67e22"
        onConfirm={() => { logoutUser(); navigate('/login') }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const styles = {
  topbar: {
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#fff', borderBottom: '1px solid #e8ecf0',
    height: 56, marginBottom: 24,
    marginLeft: -32, marginRight: -32, paddingLeft: 20, paddingRight: 32,
  },
  toggleBtn: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#2563eb', border: 'none',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    boxShadow: '0 2px 6px rgba(37,99,235,0.35)',
  },
  pageTitle: { fontSize: 17, fontWeight: 700, color: '#1a3c5e', margin: 0 },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  iconWrap: { position: 'relative' },
  iconBtn: {
    display: 'flex', alignItems: 'center', position: 'relative',
    background: '#f5f7fa', border: 'none', borderRadius: 10,
    padding: '7px 10px', cursor: 'pointer', color: '#555',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    background: '#e74c3c', color: '#fff', borderRadius: '50%',
    width: 18, height: 18, fontSize: 10, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badgeInline: {
    background: '#e74c3c', color: '#fff', borderRadius: 10,
    padding: '1px 8px', fontSize: 11, fontWeight: 700,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#2563eb', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#fff', borderRadius: 12, minWidth: 300,
    boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid #e8ecf0',
    zIndex: 500, overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderBottom: '1px solid #f0f2f5',
  },
  dropdownTitle: { fontSize: 14, fontWeight: 700, color: '#1a3c5e' },
  dropdownDivider: { height: 1, background: '#f0f2f5', margin: '4px 0' },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '10px 16px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 14, color: '#444', textAlign: 'left',
  },
  emptyNotif: {
    textAlign: 'center', padding: '24px 16px', color: '#aaa',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  notifGroup: { padding: '8px 0' },
  notifGroupTitle: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 700, color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    padding: '4px 16px',
  },
  notifItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '8px 16px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: '#333', textAlign: 'left',
  },
  notifDot: (color) => ({
    width: 8, height: 8, borderRadius: '50%',
    background: color, flexShrink: 0,
  }),
  notifMore: {
    width: '100%', padding: '6px 16px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 12, color: '#2563eb', textAlign: 'left',
  },
  profilHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px',
  },
  profilName: { fontSize: 14, fontWeight: 700, color: '#1a3c5e' },
  profilRole: { fontSize: 12, color: '#888' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 14, padding: 28, width: 480,
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, color: '#1a3c5e', margin: 0, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 },
  separator: {
    display: 'flex', alignItems: 'center', margin: '16px 0 12px',
  },
  separatorText: {
    fontSize: 11, color: '#aaa', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    background: '#fff', padding: '0 8px',
    borderTop: '1px solid #e8ecf0', paddingTop: 12, width: '100%',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  input: {
    width: '100%', padding: '9px 12px', border: '1px solid #e0e4ea',
    borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
  },
  btnPrimary: {
    background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
    padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
  },
  btnSecondary: {
    background: '#f1f3f5', color: '#444', border: 'none', borderRadius: 8,
    padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
  },
  successMsg: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#eafaf1', color: '#27ae60', borderRadius: 8,
    padding: '10px 14px', marginBottom: 16, fontSize: 14, fontWeight: 600,
  },
}
