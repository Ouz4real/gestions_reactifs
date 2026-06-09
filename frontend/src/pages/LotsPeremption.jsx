import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { CalendarClock, AlertTriangle, Search, X } from 'lucide-react'
import { getLotsPerimantBientot } from '../api/lots'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import Pagination from '../components/Pagination'
import { Link } from 'react-router-dom'

const PAGE_SIZE = 10

export default function LotsPeremption() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filtreUrgence, setFiltreUrgence] = useState('')

  const { data: lots = [], isLoading } = useQuery({
    queryKey: ['lots-peremption'],
    queryFn: () => getLotsPerimantBientot().then(r => r.data),
  })

  const today = new Date()
  const getDaysLeft = (dateStr) => Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24))

  const filtered = lots.filter(l => {
    const days = getDaysLeft(l.datePeremption)
    const matchSearch =
      l.produitNom.toLowerCase().includes(search.toLowerCase()) ||
      l.numeroLot.toLowerCase().includes(search.toLowerCase())
    const matchUrgence =
      !filtreUrgence ||
      (filtreUrgence === 'urgent' && days <= 30) ||
      (filtreUrgence === 'proche' && days > 30)
    return matchSearch && matchUrgence
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <CalendarClock size={22} color="#e67e22" />
          <h2 style={styles.title}>Lots périmant dans les 60 jours</h2>
        </div>
        <span style={styles.count}>{lots.length} lot{lots.length > 1 ? 's' : ''} concerné{lots.length > 1 ? 's' : ''}</span>
      </div>

      {/* Barre de recherche */}
      <div style={styles.searchBar}>
        <div style={styles.searchInputWrap}>
          <Search size={16} color="#aaa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={styles.searchInput}
            placeholder="Rechercher par produit ou numéro de lot..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => { setSearch(''); setPage(1) }}>
              <X size={14} />
            </button>
          )}
        </div>
        <select
          style={styles.filterSelect}
          value={filtreUrgence}
          onChange={e => { setFiltreUrgence(e.target.value); setPage(1) }}
        >
          <option value="">Tous</option>
          <option value="urgent">Urgent (≤ 30 jours)</option>
          <option value="proche">Proche (31–60 jours)</option>
        </select>
        {(search || filtreUrgence) && (
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
                {['Produit', 'N° Lot', 'Date acquisition', 'Date péremption', 'Jours restants', 'Qté restante', 'Urgence'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(l => {
                const days = getDaysLeft(l.datePeremption)
                const urgent = days <= 30
                return (
                  <tr key={l.id}>
                    <td style={styles.td}>
                      <Link to={`/produits/${l.produitId}`} style={{ color: '#1a3c5e', fontWeight: 600 }}>
                        {l.produitNom}
                      </Link>
                    </td>
                    <td style={styles.td}>{l.numeroLot}</td>
                    <td style={styles.td}>{l.dateAcquisition}</td>
                    <td style={{ ...styles.td, color: urgent ? '#e74c3c' : '#e67e22', fontWeight: 600 }}>
                      {l.datePeremption}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700, color: urgent ? '#e74c3c' : '#e67e22' }}>
                      {days} j
                    </td>
                    <td style={styles.td}>{l.quantiteRestante}</td>
                    <td style={styles.td}>
                      {urgent
                        ? <span style={styles.badgeUrgent}><AlertTriangle size={11} /> Urgent</span>
                        : <span style={styles.badgeWarn}><CalendarClock size={11} /> Proche</span>}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#aaa', padding: 40 }}>
                    Aucun résultat
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10 },
  title: { fontSize: 22, color: '#1a3c5e', margin: 0 },
  count: { fontSize: 13, background: '#fef3e2', color: '#e67e22', borderRadius: 20, padding: '4px 14px', fontWeight: 600 },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  searchInputWrap: { position: 'relative', flex: 1, minWidth: 220 },
  searchInput: { width: '100%', padding: '10px 36px', border: '1.5px solid #e0e4ea',
    borderRadius: 10, fontSize: 14, boxSizing: 'border-box', background: '#fff', outline: 'none' },
  clearBtn: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', padding: 2 },
  filterSelect: { padding: '10px 14px', border: '1.5px solid #e0e4ea', borderRadius: 10,
    fontSize: 14, background: '#fff', cursor: 'pointer', color: '#444', outline: 'none' },
  resultCount: { fontSize: 13, color: '#e67e22', fontWeight: 600, background: '#fef3e2', borderRadius: 20, padding: '4px 12px' },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 14px', background: '#f5f7fa', fontSize: 12, color: '#666', borderBottom: '2px solid #e8ecf0' },
  td: { padding: '11px 14px', fontSize: 14, borderBottom: '1px solid #f0f2f5' },
  badgeUrgent: { background: '#fdecea', color: '#e74c3c', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  badgeWarn: { background: '#fef3e2', color: '#e67e22', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
}
