import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, User, Calendar } from 'lucide-react'
import { getDemandesEnAttente, validerDemande } from '../api/demandes'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'

export default function ValidationDemandes() {
  const qc = useQueryClient()
  const [error, setError] = useState(null)
  const [commentaires, setCommentaires] = useState({})

  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ['demandes-attente'],
    queryFn: () => getDemandesEnAttente().then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: ({ id, approuver, commentaire }) => validerDemande(id, approuver, commentaire),
    onSuccess: () => qc.invalidateQueries(['demandes-attente']),
    onError: setError,
  })

  return (
    <Layout>
      <h2 style={styles.title}>Validation des demandes</h2>
      {error && <ErrorMsg error={error} />}
      {isLoading ? <Spinner /> : (
        <div style={styles.list}>
          {demandes.length === 0 && (
            <div style={styles.empty}>
              <CheckCircle size={40} color="#ccc" />
              <p>Aucune demande en attente de validation</p>
            </div>
          )}
          {demandes.map(d => (
            <div key={d.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={{ flex: 1 }}>
                  <div style={styles.produitNom}>{d.produitNom}</div>
                  <div style={styles.meta}>
                    <User size={12} /> {d.demandeurNom}
                    <span style={styles.sep}>·</span>
                    <Calendar size={12} /> {new Date(d.dateCreation).toLocaleDateString('fr-FR')}
                  </div>
                  {d.motif && <div style={styles.motif}>"{d.motif}"</div>}
                </div>
                <div style={styles.qteBox}>
                  <div style={styles.qte}>{d.quantiteDemandee}</div>
                  <div style={styles.qteLabel}>unités</div>
                </div>
              </div>
              <div style={styles.commentaireRow}>
                <input style={styles.input} placeholder="Commentaire (optionnel)"
                  value={commentaires[d.id] || ''}
                  onChange={e => setCommentaires(prev => ({ ...prev, [d.id]: e.target.value }))} />
              </div>
              <div style={styles.actions}>
                <button style={styles.btnReject} disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: d.id, approuver: false, commentaire: commentaires[d.id] })}>
                  <XCircle size={15} /> Rejeter
                </button>
                <button style={styles.btnApprove} disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: d.id, approuver: true, commentaire: commentaires[d.id] })}>
                  <CheckCircle size={15} /> Valider
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

const styles = {
  title: { fontSize: 22, color: '#1a3c5e', marginBottom: 20 },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  empty: { textAlign: 'center', color: '#aaa', padding: 48, background: '#fff', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  produitNom: { fontSize: 17, fontWeight: 700, color: '#1a3c5e', marginBottom: 6 },
  meta: { fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 5 },
  sep: { color: '#ccc' },
  motif: { fontSize: 13, color: '#666', marginTop: 6, fontStyle: 'italic' },
  qteBox: { textAlign: 'center', background: '#f0f4ff', borderRadius: 10, padding: '10px 20px' },
  qte: { fontSize: 30, fontWeight: 700, color: '#2563eb', lineHeight: 1 },
  qteLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  commentaireRow: { marginBottom: 14 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e0e4ea', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 10 },
  btnApprove: { background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
  btnReject: { background: '#fdecea', color: '#e74c3c', border: '1px solid #f5c6c6', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
}
