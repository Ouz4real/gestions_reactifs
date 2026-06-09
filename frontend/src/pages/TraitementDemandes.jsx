import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Truck, User, CheckCircle } from 'lucide-react'
import { getDemandesValidees, traiterDemande } from '../api/demandes'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'

export default function TraitementDemandes() {
  const qc = useQueryClient()
  const [error, setError] = useState(null)

  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ['demandes-validees'],
    queryFn: () => getDemandesValidees().then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: traiterDemande,
    onSuccess: () => qc.invalidateQueries(['demandes-validees']),
    onError: setError,
  })

  return (
    <Layout>
      <h2 style={styles.title}>Distribution du stock</h2>
      {error && <ErrorMsg error={error} />}
      {isLoading ? <Spinner /> : (
        <div style={styles.list}>
          {demandes.length === 0 && (
            <div style={styles.empty}>
              <Truck size={40} color="#ccc" />
              <p>Aucune demande validée en attente de traitement</p>
            </div>
          )}
          {demandes.map(d => (
            <div key={d.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={{ flex: 1 }}>
                  <div style={styles.produitNom}>{d.produitNom}</div>
                  <div style={styles.meta}>
                    <User size={12} /> {d.demandeurNom}
                    {d.valideurNom && (
                      <><span style={styles.sep}>·</span>
                      <CheckCircle size={12} color="#27ae60" /> Validé par {d.valideurNom}</>
                    )}
                  </div>
                  {d.motif && <div style={styles.motif}>"{d.motif}"</div>}
                  {d.commentaireValidation && <div style={styles.motif}>Note : {d.commentaireValidation}</div>}
                </div>
                <div style={styles.qteBox}>
                  <div style={styles.qte}>{d.quantiteDemandee}</div>
                  <div style={styles.qteLabel}>unités</div>
                </div>
              </div>
              <div style={styles.actions}>
                <button style={styles.btnTraiter} onClick={() => mutation.mutate(d.id)} disabled={mutation.isPending}>
                  <Truck size={15} /> Distribuer (FIFO)
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
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  produitNom: { fontSize: 17, fontWeight: 700, color: '#1a3c5e', marginBottom: 6 },
  meta: { fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 5 },
  sep: { color: '#ccc' },
  motif: { fontSize: 13, color: '#666', marginTop: 4, fontStyle: 'italic' },
  qteBox: { textAlign: 'center', background: '#f0f4ff', borderRadius: 10, padding: '10px 20px' },
  qte: { fontSize: 30, fontWeight: 700, color: '#2563eb', lineHeight: 1 },
  qteLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  actions: { display: 'flex', justifyContent: 'flex-end' },
  btnTraiter: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
}
