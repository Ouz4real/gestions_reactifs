import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, X, Search } from 'lucide-react'
import { getProduits, createProduit, updateProduit, deleteProduit } from '../api/produits'
import { useAuth } from '../auth/AuthContext'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import ErrorMsg from '../components/ErrorMsg'
import Pagination from '../components/Pagination'

const CATEGORIES = ['REACTIF', 'CONSOMMABLE']
const PAGE_SIZE = 8

export default function Produits() {
  const { hasRole } = useAuth()
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filtreCategorie, setFiltreCategorie] = useState('')
  const { register, handleSubmit, reset, setValue } = useForm()

  const { data: produits = [], isLoading } = useQuery({
    queryKey: ['produits'],
    queryFn: () => getProduits().then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (data) => modal?.id ? updateProduit(modal.id, data) : createProduit(data),
    onSuccess: () => { qc.invalidateQueries(['produits']); closeModal() },
    onError: setError,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduit,
    onSuccess: () => qc.invalidateQueries(['produits']),
  })

  const openCreate = () => { reset({}); setModal('create'); setError(null) }
  const openEdit = (p) => { setModal(p); setError(null); Object.entries(p).forEach(([k, v]) => setValue(k, v)) }
  const closeModal = () => { setModal(null); reset({}); setError(null) }

  // Filtrage local
  const filtered = produits.filter(p => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase()) ||
      (p.type || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.fournisseur || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !filtreCategorie || p.categorie === filtreCategorie
    return matchSearch && matchCat
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <div style={styles.header}>
        <h2 style={styles.title}>Produits</h2>
        {hasRole('ROLE_ADMIN', 'ROLE_MAGASINIER') && (
          <button style={styles.btnPrimary} onClick={openCreate}>
            <Plus size={16} /> Nouveau produit
          </button>
        )}
      </div>

      {/* Barre de recherche + filtre */}
      <div style={styles.searchBar}>
        <div style={styles.searchInputWrap}>
          <Search size={16} color="#aaa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={styles.searchInput}
            placeholder="Rechercher par nom, type, fournisseur..."
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
          value={filtreCategorie}
          onChange={e => { setFiltreCategorie(e.target.value); setPage(1) }}
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || filtreCategorie) && (
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
                {['Nom', 'Catégorie', 'Type', 'Unité', 'Stock', 'Seuil', 'Statut', ...(hasRole('ROLE_ADMIN', 'ROLE_MAGASINIER') ? ['Actions'] : [])].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>
                    <Link to={`/produits/${p.id}`} style={{ color: '#1a3c5e', fontWeight: 600 }}>
                      {p.nom}
                    </Link>
                  </td>
                  <td style={styles.td}>{p.categorie}</td>
                  <td style={styles.td}>{p.type || '—'}</td>
                  <td style={styles.td}>{p.unite || '—'}</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: p.enAlerte ? '#e74c3c' : '#27ae60' }}>
                    {p.stockTotal}
                  </td>
                  <td style={styles.td}>{p.seuilAlerte}</td>
                  <td style={styles.td}>
                    {p.enAlerte
                      ? <span style={styles.badgeDanger}><AlertTriangle size={11} /> Alerte</span>
                      : <span style={styles.badgeOk}><CheckCircle size={11} /> OK</span>}
                  </td>
                  <td style={styles.td}>
                    {hasRole('ROLE_ADMIN', 'ROLE_MAGASINIER') && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={styles.btnIcon} onClick={() => openEdit(p)} title="Modifier">
                          <Pencil size={14} />
                        </button>
                        <button style={styles.btnIconDanger}
                          onClick={() => window.confirm('Supprimer ce produit ?') && deleteMutation.mutate(p.id)}
                          title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {produits.length === 0 && (
                <tr><td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#aaa', padding: 32 }}>
                  Aucun produit enregistré
                </td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{modal?.id ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button style={styles.closeBtn} onClick={closeModal}><X size={18} /></button>
            </div>
            {error && <ErrorMsg error={error} />}
            <form onSubmit={handleSubmit(d => saveMutation.mutate(d))}>
              <Field label="Nom *"><input style={styles.input} {...register('nom', { required: true })} /></Field>
              <Field label="Catégorie *">
                <select style={styles.input} {...register('categorie', { required: true })}>
                  <option value="">-- Choisir --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Type"><input style={styles.input} {...register('type')} /></Field>
                <Field label="Unité"><input style={styles.input} {...register('unite')} /></Field>
              </div>
              <Field label="Fournisseur"><input style={styles.input} {...register('fournisseur')} /></Field>
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Température conservation">
                  <input style={styles.input} {...register('temperatureConservation')} />
                </Field>
                <Field label="Seuil alerte">
                  <input style={styles.input} type="number" {...register('seuilAlerte', { valueAsNumber: true })} />
                </Field>
              </div>
              <Field label="Description">
                <textarea style={{ ...styles.input, height: 60, resize: 'vertical' }} {...register('description')} />
              </Field>
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnSecondary} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.btnPrimary} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12, flex: 1 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, color: '#1a3c5e', margin: 0 },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
    flexWrap: 'wrap',
  },
  searchInputWrap: {
    position: 'relative', flex: 1, minWidth: 220,
  },
  searchInput: {
    width: '100%', padding: '10px 36px 10px 36px',
    border: '1.5px solid #e0e4ea', borderRadius: 10, fontSize: 14,
    boxSizing: 'border-box', background: '#fff',
    outline: 'none', transition: 'border-color 0.15s',
  },
  clearBtn: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#aaa',
    display: 'flex', alignItems: 'center', padding: 2,
  },
  filterSelect: {
    padding: '10px 14px', border: '1.5px solid #e0e4ea', borderRadius: 10,
    fontSize: 14, background: '#fff', cursor: 'pointer', color: '#444',
    outline: 'none',
  },
  resultCount: {
    fontSize: 13, color: '#2563eb', fontWeight: 600,
    background: '#e8f0fe', borderRadius: 20, padding: '4px 12px',
  },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 14px', background: '#f5f7fa', fontSize: 12, color: '#666', borderBottom: '2px solid #e8ecf0' },
  tr: { transition: 'background 0.1s' },
  td: { padding: '11px 14px', fontSize: 14, borderBottom: '1px solid #f0f2f5' },
  btnPrimary: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
    padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
    display: 'flex', alignItems: 'center', gap: 6 },
  btnSecondary: { background: '#f1f3f5', color: '#444', border: 'none', borderRadius: 8,
    padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnIcon: { background: '#e8f0fe', color: '#2563eb', border: 'none', borderRadius: 6,
    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  btnIconDanger: { background: '#fdecea', color: '#e74c3c', border: 'none', borderRadius: 6,
    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  badgeDanger: { background: '#fdecea', color: '#e74c3c', borderRadius: 20,
    padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  badgeOk: { background: '#eafaf1', color: '#27ae60', borderRadius: 20,
    padding: '3px 10px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 14, padding: 28, width: 500,
    maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, color: '#1a3c5e', margin: 0, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e0e4ea',
    borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
}

