import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { UserPlus, UserCheck, UserX, X, ShieldCheck, Pencil, Trash2, Power } from 'lucide-react'
import { getUtilisateurs, createUtilisateur, toggleActif, updateRole, deleteUtilisateur, updateUtilisateur } from '../api/utilisateurs'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'
import Pagination from '../components/Pagination'
import ConfirmModal from '../components/ConfirmModal'

const ROLE_COLORS = {
  ROLE_ADMIN:       { bg: '#fdecea', color: '#e74c3c' },
  ROLE_MAGASINIER:  { bg: '#e8f0fe', color: '#2563eb' },
  ROLE_MAJOR:       { bg: '#fef3e2', color: '#e67e22' },
  ROLE_TECHNICIEN:  { bg: '#eafaf1', color: '#27ae60' },
}

const ROLES = ['ROLE_TECHNICIEN', 'ROLE_MAJOR', 'ROLE_MAGASINIER', 'ROLE_ADMIN']
const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrateur', ROLE_MAGASINIER: 'Magasinier',
  ROLE_MAJOR: 'Major', ROLE_TECHNICIEN: 'Technicien',
}
const PAGE_SIZE = 8

export default function Utilisateurs() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false) // false | 'create' | utilisateur
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null) // utilisateur à supprimer
  const { register, handleSubmit, reset, setValue } = useForm()

  const { data: utilisateurs = [], isLoading } = useQuery({
    queryKey: ['utilisateurs'],
    queryFn: () => getUtilisateurs().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: createUtilisateur,
    onSuccess: () => { qc.invalidateQueries(['utilisateurs']); setModal(false); reset(); setError(null) },
    onError: setError,
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUtilisateur(id, data),
    onSuccess: () => { qc.invalidateQueries(['utilisateurs']); setModal(false); reset(); setError(null) },
    onError: setError,
  })
  const toggleMutation = useMutation({
    mutationFn: toggleActif,
    onSuccess: () => qc.invalidateQueries(['utilisateurs']),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteUtilisateur,
    onSuccess: () => qc.invalidateQueries(['utilisateurs']),
  })
  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => updateRole(id, role),
    onSuccess: () => qc.invalidateQueries(['utilisateurs']),
  })

  const openCreate = () => { reset({}); setModal('create'); setError(null) }
  const openEdit = (u) => {
    setModal(u)
    setError(null)
    setValue('nom', u.nom)
    setValue('prenom', u.prenom)
    setValue('email', u.email)
    setValue('role', u.role)
    setValue('motDePasse', '')
  }
  const closeModal = () => { setModal(false); reset(); setError(null) }

  const handleSubmitForm = (data) => {
    if (modal?.id) {
      updateMutation.mutate({ id: modal.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <Layout>
      <div style={styles.header}>
        <h2 style={styles.title}>Gestion des utilisateurs</h2>
        <button style={styles.btnPrimary} onClick={openCreate}>
          <UserPlus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {isLoading ? <Spinner /> : (() => {
        const totalPages = Math.ceil(utilisateurs.length / PAGE_SIZE)
        const paginated = utilisateurs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        return (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(u => (
                  <tr key={u.id}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>{u.prenom?.[0]}{u.nom?.[0]}</div>
                        <div><div style={styles.userName}>{u.prenom} {u.nom}</div></div>
                      </div>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{
                        background: ROLE_COLORS[u.role]?.bg,
                        color: ROLE_COLORS[u.role]?.color,
                        borderRadius: 20,
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-block',
                      }}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={u.actif ? styles.badgeOk : styles.badgeOff}>
                        {u.actif ? <><UserCheck size={11} /> Actif</> : <><UserX size={11} /> Désactivé</>}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {/* Modifier */}
                        <button
                          style={styles.iconBtn}
                          title="Modifier"
                          onClick={() => openEdit(u)}
                        >
                          <Pencil size={15} color="#2563eb" />
                        </button>
                        {/* Activer / Désactiver */}
                        <button
                          style={{ ...styles.iconBtn, background: u.actif ? '#fef3e2' : '#eafaf1' }}
                          title={u.actif ? 'Désactiver' : 'Activer'}
                          onClick={() => toggleMutation.mutate(u.id)}
                        >
                          <Power size={15} color={u.actif ? '#e67e22' : '#27ae60'} />
                        </button>
                        {/* Supprimer */}
                        <button
                          style={{ ...styles.iconBtn, background: '#fdecea' }}
                          title="Supprimer"
                          onClick={() => setDeleteTarget(u)}
                        >
                          <Trash2 size={15} color="#e74c3c" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )
      })()}

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {modal?.id ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button style={styles.closeBtn} onClick={closeModal}><X size={18} /></button>
            </div>
            {error && <ErrorMsg error={error} />}
            <form onSubmit={handleSubmit(handleSubmitForm)}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Nom *"><input style={styles.input} {...register('nom', { required: true })} /></Field>
                <Field label="Prénom *"><input style={styles.input} {...register('prenom', { required: true })} /></Field>
              </div>
              <Field label="Email *"><input style={styles.input} type="email" {...register('email', { required: true })} /></Field>
              <Field label={modal?.id ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}>
                <input style={styles.input} type="password"
                  {...register('motDePasse', { required: !modal?.id })}
                  placeholder={modal?.id ? '••••••••' : ''} />
              </Field>
              <Field label="Rôle *">
                <select style={styles.input} {...register('role', { required: true })}>
                  <option value="">-- Choisir --</option>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </Field>
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnSecondary} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.btnPrimary}
                  disabled={createMutation.isPending || updateMutation.isPending}>
                  {modal?.id
                    ? <><Pencil size={15} /> {updateMutation.isPending ? 'Modification...' : 'Modifier'}</>
                    : <><UserPlus size={15} /> {createMutation.isPending ? 'Création...' : 'Créer'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        icon="warning"
        title="Supprimer l'utilisateur"
        message={deleteTarget ? `Voulez-vous vraiment supprimer ${deleteTarget.prenom} ${deleteTarget.nom} ? Cette action est irréversible.` : ''}
        confirmLabel="Supprimer"
        confirmColor="#e74c3c"
        onConfirm={() => { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14, flex: 1 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, color: '#1a3c5e', margin: 0 },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 14px', background: '#f5f7fa', fontSize: 12, color: '#666', borderBottom: '2px solid #e8ecf0' },
  td: { padding: '11px 14px', fontSize: 14, borderBottom: '1px solid #f0f2f5' },
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: '50%', background: '#e8f0fe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  userName: { fontWeight: 600, color: '#1a3c5e', fontSize: 14 },
  roleCell: { display: 'flex', alignItems: 'center', gap: 6 },
  roleSelect: { border: '1px solid #e0e4ea', borderRadius: 6, padding: '4px 8px', fontSize: 13, color: '#333' },
  badgeOk: { background: '#eafaf1', color: '#27ae60', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  badgeOff: { background: '#f5f5f5', color: '#999', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  btnSmOk: { background: '#eafaf1', color: '#27ae60', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  btnSmDanger: { background: '#fdecea', color: '#e74c3c', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#e8f0fe', transition: 'opacity 0.15s',
  },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 14, padding: 28, width: 460, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, color: '#1a3c5e', margin: 0, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e0e4ea', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  btnPrimary: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
  btnSecondary: { background: '#f1f3f5', color: '#444', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
}
