import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, PackagePlus, TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react'
import { getProduit } from '../api/produits'
import { getLotsByProduit } from '../api/lots'
import { getHistoriqueProduit } from '../api/stock'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import { useAuth } from '../auth/AuthContext'
import Pagination from '../components/Pagination'
import { useState } from 'react'

const PAGE_LOTS = 5
const PAGE_HIST = 8

export default function ProduitDetail() {
  const { id } = useParams()
  const { hasRole } = useAuth()
  const [pageLots, setPageLots] = useState(1)
  const [pageHist, setPageHist] = useState(1)

  const { data: produit, isLoading: loadP } = useQuery({
    queryKey: ['produit', id],
    queryFn: () => getProduit(id).then(r => r.data),
  })
  const { data: lots = [], isLoading: loadL } = useQuery({
    queryKey: ['lots', id],
    queryFn: () => getLotsByProduit(id).then(r => r.data),
  })
  const { data: historique = [], isLoading: loadH } = useQuery({
    queryKey: ['historique', id],
    queryFn: () => getHistoriqueProduit(id).then(r => r.data),
  })

  if (loadP) return <Layout><Spinner /></Layout>

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <Link to="/produits" style={styles.back}>
            <ArrowLeft size={14} /> Retour aux produits
          </Link>
          <h2 style={styles.title}>{produit?.nom}</h2>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <span style={styles.cat}>{produit?.categorie}</span>
            {produit?.type && <span style={styles.cat}>{produit.type}</span>}
          </div>
        </div>
        <div style={{ ...styles.stockBox, borderColor: produit?.enAlerte ? '#e74c3c' : '#27ae60' }}>
          <div style={{ ...styles.stockVal, color: produit?.enAlerte ? '#e74c3c' : '#27ae60' }}>
            {produit?.stockTotal}
          </div>
          <div style={styles.stockLabel}>{produit?.unite || 'unités'} en stock</div>
          {produit?.enAlerte && (
            <div style={styles.alerteTag}>
              <AlertTriangle size={12} /> Stock faible
            </div>
          )}
        </div>
      </div>

      {/* Infos produit */}
      <div style={styles.infoGrid}>
        {[['Fournisseur', produit?.fournisseur], ['Température', produit?.temperatureConservation],
          ['Seuil alerte', produit?.seuilAlerte], ['Description', produit?.description]]
          .filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={styles.infoItem}>
              <span style={styles.infoKey}>{k}</span>
              <span style={styles.infoVal}>{v}</span>
            </div>
          ))}
      </div>

      {/* Lots */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Lots actifs — ordre FIFO</h3>
          {hasRole('ROLE_MAGASINIER', 'ROLE_ADMIN') && (
            <Link to={`/lots/nouveau?produitId=${id}`} style={styles.btnPrimary}>
              <PackagePlus size={15} /> Réceptionner un lot
            </Link>
          )}
        </div>
        {loadL ? <Spinner /> : (() => {
          const totalPages = Math.ceil(lots.length / PAGE_LOTS)
          const paginated = lots.slice((pageLots - 1) * PAGE_LOTS, pageLots * PAGE_LOTS)
          return (
            <>
              <table style={styles.table}>
                <thead><tr>
                  {['N° Lot', 'Acquisition', 'Péremption', 'Qté initiale', 'Qté restante', 'Statut'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {paginated.map(l => (
                    <tr key={l.id}>
                      <td style={styles.td}>{l.numeroLot}</td>
                      <td style={styles.td}>{l.dateAcquisition}</td>
                      <td style={{ ...styles.td, color: l.perimeOuProche ? '#e67e22' : 'inherit', fontWeight: l.perimeOuProche ? 600 : 400 }}>
                        {l.perimeOuProche && <Clock size={12} style={{ marginRight: 4 }} />}
                        {l.datePeremption}
                      </td>
                      <td style={styles.td}>{l.quantiteInitiale}</td>
                      <td style={{ ...styles.td, fontWeight: 700 }}>{l.quantiteRestante}</td>
                      <td style={styles.td}>
                        {l.quantiteRestante === 0
                          ? <span style={styles.badgeEmpty}>Épuisé</span>
                          : l.perimeOuProche
                            ? <span style={styles.badgeWarn}>Proche péremption</span>
                            : <span style={styles.badgeOk}>Actif</span>}
                      </td>
                    </tr>
                  ))}
                  {lots.length === 0 && (
                    <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#aaa', padding: 28 }}>
                      Aucun lot actif
                    </td></tr>
                  )}
                </tbody>
              </table>
              <Pagination page={pageLots} totalPages={totalPages} onChange={setPageLots} />
            </>
          )
        })()}
      </div>

      {/* Historique */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Historique des mouvements</h3>
        {loadH ? <Spinner /> : (() => {
          const totalPages = Math.ceil(historique.length / PAGE_HIST)
          const paginated = historique.slice((pageHist - 1) * PAGE_HIST, pageHist * PAGE_HIST)
          return (
            <>
              <table style={styles.table}>
                <thead><tr>
                  {['Date', 'Type', 'Quantité', 'N° Lot', 'Motif', 'Utilisateur'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {paginated.map(m => (
                    <tr key={m.id}>
                      <td style={styles.td}>{new Date(m.dateMouvement).toLocaleString('fr-FR')}</td>
                      <td style={styles.td}>
                        {m.type === 'ENTREE'
                          ? <span style={styles.badgeIn}><TrendingUp size={11} /> Entrée</span>
                          : <span style={styles.badgeOut}><TrendingDown size={11} /> Sortie</span>}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 700 }}>{m.quantite}</td>
                      <td style={styles.td}>{m.numeroLot}</td>
                      <td style={styles.td}>{m.motif || '—'}</td>
                      <td style={styles.td}>{m.utilisateurNom}</td>
                    </tr>
                  ))}
                  {historique.length === 0 && (
                    <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#aaa', padding: 28 }}>
                      Aucun mouvement
                    </td></tr>
                  )}
                </tbody>
              </table>
              <Pagination page={pageHist} totalPages={totalPages} onChange={setPageHist} />
            </>
          )
        })()}
      </div>
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  back: { color: '#2563eb', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6 },
  title: { fontSize: 24, color: '#1a3c5e', margin: '0 0 4px' },
  cat: { background: '#e8f0fe', color: '#2563eb', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 },
  stockBox: { textAlign: 'center', background: '#fff', borderRadius: 12, padding: '16px 28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid' },
  stockVal: { fontSize: 40, fontWeight: 700, lineHeight: 1 },
  stockLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  alerteTag: { background: '#fdecea', color: '#e74c3c', borderRadius: 8, padding: '3px 10px',
    fontSize: 12, marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 },
  infoGrid: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  infoItem: { background: '#fff', borderRadius: 10, padding: '10px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minWidth: 160 },
  infoKey: { display: 'block', fontSize: 11, color: '#999', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' },
  infoVal: { fontSize: 14, color: '#333', fontWeight: 600 },
  section: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, color: '#1a3c5e', margin: '0 0 16px', fontWeight: 700 },
  btnPrimary: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
    padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', background: '#f5f7fa', fontSize: 12, color: '#666', borderBottom: '2px solid #e8ecf0' },
  td: { padding: '10px 12px', fontSize: 14, borderBottom: '1px solid #f0f2f5' },
  badgeIn: { background: '#eafaf1', color: '#27ae60', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  badgeOut: { background: '#fdecea', color: '#e74c3c', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  badgeOk: { background: '#eafaf1', color: '#27ae60', borderRadius: 20, padding: '3px 8px', fontSize: 12 },
  badgeWarn: { background: '#fef3e2', color: '#e67e22', borderRadius: 20, padding: '3px 8px', fontSize: 12 },
  badgeEmpty: { background: '#f5f5f5', color: '#999', borderRadius: 20, padding: '3px 8px', fontSize: 12 },
}
