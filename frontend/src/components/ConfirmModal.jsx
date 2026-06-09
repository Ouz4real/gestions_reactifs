import { AlertTriangle, LogOut, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, onConfirm, onCancel, title, message, confirmLabel = 'Confirmer', confirmColor = '#e74c3c', icon = 'warning' }) {
  if (!isOpen) return null

  const Icon = icon === 'logout' ? LogOut : AlertTriangle
  const iconColor = icon === 'logout' ? '#e67e22' : '#e74c3c'
  const iconBg = icon === 'logout' ? '#fef3e2' : '#fdecea'

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.iconWrap}>
          <div style={{ ...styles.iconCircle, background: iconBg }}>
            <Icon size={24} color={iconColor} />
          </div>
        </div>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button style={styles.btnCancel} onClick={onCancel}>Annuler</button>
          <button style={{ ...styles.btnConfirm, background: confirmColor }} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: '32px 28px', width: 380,
    boxShadow: '0 12px 48px rgba(0,0,0,0.2)', textAlign: 'center',
  },
  iconWrap: { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  iconCircle: {
    width: 56, height: 56, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: 700, color: '#1a3c5e', margin: '0 0 10px' },
  message: { fontSize: 14, color: '#666', margin: '0 0 24px', lineHeight: 1.6 },
  actions: { display: 'flex', gap: 10, justifyContent: 'center' },
  btnCancel: {
    flex: 1, padding: '10px 0', background: '#f1f3f5', color: '#444',
    border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  btnConfirm: {
    flex: 1, padding: '10px 0', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
}
