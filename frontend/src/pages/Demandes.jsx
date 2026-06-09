import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, X, Clock, CheckCircle, XCircle, Package, Eye } from 'lucide-react'
import { getMesDemandes, creerDemande } from '../api/demandes'
import { getProduits } from '../api/produits'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 8

const STATUT_CONFIG = {
  EN_ATTENTE: { bg: '#fef3e2', color: '#e67e22', Icon: Clock,        label: 'En attente' },
  VALIDEE:    { bg: '#eafaf1', color: '#27ae60', Icon: CheckCircle,  label: 'Validée' },
  REJETEE:    { bg: '#fdecea', color: '#e74c3c', Icon: XCircle,      label: 'Rejetée' },
  TRAITEE:    { bg: '#e8f0fe', color: '#2563eb', Icon: Package,      label: 'Traitée' },
}

export default function Demandes() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [detail, setDetail] = useState(null) // demande sélectionnée pour le détail
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const { register, handleSubmit, reset } = useForm()

  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ['mes-demandes'],
    queryFn: () => getMesDemandes().then(r => r.data),
  })
  const { data: produits = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: () => getProduits().then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: creerDemande,
    onSuccess: () => { qc.invalidateQueries(['mes-demandes']); setModal(false); reset(); setError(null) },
    onError: setError,
  })

  const totalPages = Math.ceil(demandes.length / PAGE_SIZE)
  const paginated = demandes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <div style={styles.header}>
        <h2 style={styles.title}>Mes demandes</h2>
        <button style={styles.btnPrimary} onClick={() => { setModal(true); setError(null) }}>
          <Plus size={16} /> Nouvelle demande
        </button>
      </div>

      {isLoading ? <Spinner /> : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Produit', 'Quantité', 'Motif', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(d => {
                const cfg = STATUT_CONFIG[d.statut] || {}
                return (
                  <tr key={d.id}>
                    <td style={styles.td}>{d.produitNom}</td>
                    <td style={styles.td}>{d.quantiteDemandee}</td>
                    <td style={styles.td}>{d.motif || '—'}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: cfg.bg, color: cfg.color }}>
                        {cfg.Icon && <cfg.Icon size={11} />} {cfg.label}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(d.dateCreation).toLocaleDateString('fr-FR')}</td>
                    <td style={styles.td}>
                      <button style={styles.btnDetail} onClick={() => setDetail(d)}>
                        <Eye size={14} /> Voir détails
                      </button>
                    </td>
                  </tr>
                )
              })}
              {demandes.length === 0 && (
                <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#aaa', padding: 32 }}>
                  Aucune demande
                </td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {/* ── Modale Nouvelle demande ── */}
      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Nouvelle demande de réactif</h3>
              <button style={styles.closeBtn} onClick={() => { setModal(false); reset() }}><X size={18} /></button>
            </div>
            {error && <ErrorMsg error={error} />}
            <form onSubmit={handleSubmit(d => mutation.mutate({
              ...d, produitId: Number(d.produitId), quantiteDemandee: Number(d.quantiteDemandee)
            }))}>
              <Field label="Produit *">
                <select style={styles.input} {...register('produitId', { required: true })}>
                  <option value="">-- Sélectionner --</option>
                  {produits.map(p => (
                    <option key={p.id} value={p.id}>{p.nom} (stock: {p.stockTotal} {p.unite})</option>
                  ))}
                </select>
              </Field>
              <Field label="Quantité *">
                <input style={styles.input} type="number" min="1" {...register('quantiteDemandee', { required: true })} />
              </Field>
              <Field label="Motif">
                <input style={styles.input} {...register('motif')} placeholder="ex: Analyses NFS semaine 15" />
              </Field>
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnSecondary} onClick={() => { setModal(false); reset() }}>Annuler</button>
                <button type="submit" style={styles.btnPrimary} disabled={mutation.isPending}>
                  <Plus size={15} /> {mutation.isPending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modale Détail demande ── */}
      {detail && (
        <div style={styles.overlay} onClick={() => setDetail(null)}>
          <div style={styles.modalDetail} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Détail de la demande</h3>
              <button style={styles.closeBtn} onClick={() => setDetail(null)}><X size={18} /></button>
            </div>

            {/* Statut en haut */}
            {(() => {
              const cfg = STATUT_CONFIG[detail.statut] || {}
              return (
                <div style={{ ...styles.statutBanner, background: cfg.bg, color: cfg.color }}>
                  {cfg.Icon && <cfg.Icon size={16} />}
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{cfg.label}</span>
                </div>
              )
            })()}

            <div style={styles.detailGrid}>
              <DetailRow label="Produit"       value={detail.produitNom} />
              <DetailRow label="Quantité"      value={`${detail.quantiteDemandee} unités`} />
              <DetailRow label="Motif"         value={detail.motif || '—'} />
              <DetailRow label="Demandeur"     value={detail.demandeurNom} />
              <DetailRow label="Date création" value={new Date(detail.dateCreation).toLocaleString('fr-FR')} />
              {detail.valideurNom && (
                <DetailRow label="Validé par" value={detail.valideurNom} />
              )}
              {detail.dateValidation && (
                <DetailRow label="Date validation" value={new Date(detail.dateValidation).toLocaleString('fr-FR')} />
              )}
              {detail.commentaireValidation && (
                <DetailRow label="Commentaire" value={detail.commentaireValidation} highlight />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button style={styles.btnPrimary} onClick={() => setDetail(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

function DetailRow({ label, value, highlight }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={{
        ...styles.detailValue,
        ...(highlight ? { background: '#fef3e2', color: '#e67e22', borderRadius: 6, padding: '3px 10px' } : {})
      }}>
        {value}
      </span>
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
  badge: { borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  btnDetail: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#e8f0fe', color: '#2563eb', border: 'none',
    borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 14, padding: 28, width: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' },
  modalDetail: { background: '#fff', borderRadius: 14, padding: 28, width: 480, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, color: '#1a3c5e', margin: 0, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  statutBanner: { display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontWeight: 600 },
  detailGrid: { display: 'flex', flexDirection: 'column', gap: 0 },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f2f5' },
  detailLabel: { fontSize: 13, color: '#888', fontWeight: 500 },
  detailValue: { fontSize: 14, color: '#1a3c5e', fontWeight: 600, textAlign: 'right', maxWidth: '60%' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e0e4ea', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  btnPrimary: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
  btnSecondary: { background: '#f1f3f5', color: '#444', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
}
