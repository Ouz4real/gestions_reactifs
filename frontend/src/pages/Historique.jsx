import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Search, X, Eye } from 'lucide-react'
import { getHistorique } from '../api/stock'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'

const PAGE_SIZE = 10

export default function Historique() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filtreType, setFiltreType] = useState('')
  const [detail, setDetail] = useState(null)

  const { data: mouvements = [], isLoading } = useQuery({
    queryKey: ['historique'],
    queryFn: () => getHistorique().then(r => r.data),
  })

  const filtered = mouvements.filter(m => {
    const matchSearch =
      m.produitNom.toLowerCase().includes(search.toLowerCase()) ||
      m.numeroLot.toLowerCase().includes(search.toLowerCase()) ||
      (m.utilisateurNom || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.motif || '').toLowerCase().includes(search.toLowerCase())
    const matchType = !filtreType || m.type === filtreType
    return matchSearch && matchType
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <h2 style={styles.title}>Historique des mouvements</h2>

      <div style={styles.searchBar}>
        <div style={styles.searchInputWrap}>
          <Search size={16} color="#aaa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={styles.searchInput}
            placeholder="Rechercher par produit, lot, utilisateur, motif..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => { setSearch(''); setPage(1) }}>
              <X size={14} />
            </button>
          )}
        </div>
        <select style={styles.filterSelect} value={filtreType}
          onChange={e => { setFiltreType(e.target.value); setPage(1) }}>
          <option value="">Tous les types</option>
          <option value="ENTREE">Entrées</option>
          <option value="SORTIE">Sorties</option>
        </select>
        {(search || filtreType) && (
          <span style={styles.resultCount}>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading ? <Spinner /> : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Date', 'Type', 'Produit', 'Quantité', 'Motif', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(m => (
                <tr key={m.id}>
                  <td style={styles.td}>{new Date(m.dateMouvement).toLocaleString('fr-FR')}</td>
                  <td style={styles.td}>
                    {m.type === 'ENTREE'
                      ? <span style={styles.badgeIn}><TrendingUp size={11} /> Entrée</span>
                      : <span style={styles.badgeOut}><TrendingDown size={11} /> Sortie</span>}
                  </td>
                  <td style={styles.td}>{m.produitNom}</td>
                  <td style={{ ...styles.td, fontWeight: 700 }}>{m.quantite}</td>
                  <td style={styles.td}>{m.motif || '—'}</td>
                  <td style={styles.td}>
                    <button style={styles.btnDetail} onClick={() => setDetail(m)}>
                      <Eye size={14} /> Voir détails
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#aaa', padding: 32 }}>
                  Aucun résultat
                </td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {/* ── Modale détail mouvement ── */}
      {detail && (
        <div style={styles.overlay} onClick={() => setDetail(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Détail du mouvement</h3>
              <button style={styles.closeBtn} onClick={() => setDetail(null)}><X size={18} /></button>
            </div>

            {/* Bandeau type */}
            <div style={{
              ...styles.typeBanner,
              background: detail.type === 'ENTREE' ? '#eafaf1' : '#fdecea',
              color: detail.type === 'ENTREE' ? '#27ae60' : '#e74c3c',
            }}>
              {detail.type === 'ENTREE'
                ? <><TrendingUp size={16} /> Entrée de stock</>
                : <><TrendingDown size={16} /> Sortie de stock</>}
            </div>

            <div style={styles.detailGrid}>
              <DetailRow label="Produit"     value={detail.produitNom} />
              <DetailRow label="N° Lot"      value={detail.numeroLot} />
              <DetailRow label="Quantité"    value={`${detail.quantite} unités`} />
              <DetailRow label="Date"        value={new Date(detail.dateMouvement).toLocaleString('fr-FR')} />
              <DetailRow label="Motif"       value={detail.motif || '—'} />
              <DetailRow label="Utilisateur" value={detail.utilisateurNom} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button style={styles.btnClose} onClick={() => setDetail(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  )
}

const styles = {
  title: { fontSize: 22, color: '#1a3c5e', marginBottom: 16 },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  searchInputWrap: { position: 'relative', flex: 1, minWidth: 220 },
  searchInput: { width: '100%', padding: '10px 36px', border: '1.5px solid #e0e4ea',
    borderRadius: 10, fontSize: 14, boxSizing: 'border-box', background: '#fff', outline: 'none' },
  clearBtn: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', padding: 2 },
  filterSelect: { padding: '10px 14px', border: '1.5px solid #e0e4ea', borderRadius: 10,
    fontSize: 14, background: '#fff', cursor: 'pointer', color: '#444', outline: 'none' },
  resultCount: { fontSize: 13, color: '#2563eb', fontWeight: 600, background: '#e8f0fe', borderRadius: 20, padding: '4px 12px' },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 14px', background: '#f5f7fa', fontSize: 12, color: '#666', borderBottom: '2px solid #e8ecf0' },
  td: { padding: '11px 14px', fontSize: 14, borderBottom: '1px solid #f0f2f5' },
  badgeIn: { background: '#eafaf1', color: '#27ae60', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  badgeOut: { background: '#fdecea', color: '#e74c3c', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  btnDetail: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e8f0fe',
    color: '#2563eb', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 14, padding: 28, width: 460,
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, color: '#1a3c5e', margin: 0, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 },
  typeBanner: { display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10,
    padding: '10px 16px', marginBottom: 20, fontWeight: 700, fontSize: 14 },
  detailGrid: { display: 'flex', flexDirection: 'column' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #f0f2f5' },
  detailLabel: { fontSize: 13, color: '#888', fontWeight: 500 },
  detailValue: { fontSize: 14, color: '#1a3c5e', fontWeight: 600, textAlign: 'right', maxWidth: '60%' },
  btnClose: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
    padding: '9px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
}
