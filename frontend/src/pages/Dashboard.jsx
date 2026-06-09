import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, CalendarClock, Package, FlaskConical,
  TrendingUp, TrendingDown, Clock, CheckCircle, ArrowRight,
  PackagePlus, ClipboardList, Users, Truck, FileText, Calendar,
} from 'lucide-react'
import { getAlertes } from '../api/stock'
import { getDashboardStats, getMouvements } from '../api/dashboard'
import { useAuth } from '../auth/AuthContext'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'

const ROLE_LABELS = {
  ROLE_ADMIN: 'Administrateur', ROLE_MAGASINIER: 'Magasinier',
  ROLE_MAJOR: 'Major', ROLE_TECHNICIEN: 'Technicien',
}

// Helpers date
const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)

export default function Dashboard() {
  const { user, hasRole } = useAuth()

  const { data: alertes, isLoading: loadA } = useQuery({
    queryKey: ['alertes'],
    queryFn: () => getAlertes().then(r => r.data),
  })
  const { data: stats, isLoading: loadS } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats().then(r => r.data),
  })

  const role = user?.role

  return (
    <Layout>
      <div style={styles.welcomeRow}>
        <div>
          <h2 style={styles.welcome}>Bonjour, {user?.prenom} {user?.nom}</h2>
          <span style={styles.roleBadge}>{ROLE_LABELS[role]}</span>
        </div>
      </div>

      {role === 'ROLE_ADMIN' && (
        <DashboardAdmin stats={stats} alertes={alertes} loadS={loadS} loadA={loadA}
          showGraph hasRole={hasRole} />
      )}
      {role === 'ROLE_MAGASINIER' && (
        <DashboardMagasinier stats={stats} alertes={alertes} loadS={loadS} loadA={loadA}
          showGraph hasRole={hasRole} />
      )}
      {role === 'ROLE_MAJOR' && (
        <DashboardMajor stats={stats} alertes={alertes} loadS={loadS} loadA={loadA} />
      )}
      {role === 'ROLE_TECHNICIEN' && (
        <DashboardTechnicien stats={stats} loadS={loadS} />
      )}
    </Layout>
  )
}

/* ─── Graphique avec sélecteur de période ─── */
function GraphiqueMouvements() {
  const [debut, setDebut] = useState(daysAgo(29))
  const [fin, setFin] = useState(today())
  const [applied, setApplied] = useState({ debut: daysAgo(29), fin: today() })

  const { data: graph = [], isLoading } = useQuery({
    queryKey: ['mouvements', applied.debut, applied.fin],
    queryFn: () => getMouvements(applied.debut, applied.fin).then(r => r.data),
  })

  const totalEntrees = graph.reduce((s, d) => s + d.entrees, 0)
  const totalSorties = graph.reduce((s, d) => s + d.sorties, 0)

  return (
    <div style={styles.section}>
      <div style={styles.graphHeader}>
        <div>
          <h3 style={{ ...styles.sectionTitle, margin: 0 }}>Mouvements de stock</h3>
          <p style={styles.graphSub}>
            Du <strong>{applied.debut}</strong> au <strong>{applied.fin}</strong>
            &nbsp;—&nbsp;
            <span style={{ color: '#2563eb' }}>↑ {totalEntrees} entrées</span>
            &nbsp;·&nbsp;
            <span style={{ color: '#e74c3c' }}>↓ {totalSorties} sorties</span>
          </p>
        </div>
        <Link to="/stock/historique" style={styles.seeAll}>
          Voir tout <ArrowRight size={13} />
        </Link>
      </div>

      {/* Sélecteur de dates */}
      <div style={styles.dateRow}>
        <Calendar size={15} color="#888" />
        <label style={styles.dateLabel}>Du</label>
        <input
          type="date"
          style={styles.dateInput}
          value={debut}
          max={fin}
          onChange={e => setDebut(e.target.value)}
        />
        <label style={styles.dateLabel}>au</label>
        <input
          type="date"
          style={styles.dateInput}
          value={fin}
          min={debut}
          max={today()}
          onChange={e => setFin(e.target.value)}
        />
        <button
          style={styles.btnApply}
          onClick={() => setApplied({ debut, fin })}
        >
          Appliquer
        </button>
        <button
          style={styles.btnReset}
          onClick={() => {
            const d = daysAgo(29), f = today()
            setDebut(d); setFin(f); setApplied({ debut: d, fin: f })
          }}
        >
          Ce mois
        </button>
      </div>

      {isLoading ? <Spinner /> : <BarChart data={graph} />}
    </div>
  )
}

/* ─── Dashboard Admin ─── */
function DashboardAdmin({ stats, alertes, loadS, loadA }) {
  return (
    <>
      {loadS ? <Spinner /> : (
        <>
          <div style={styles.statsGrid}>
            <StatCard icon={FlaskConical} color="#2563eb" bg="#e8f0fe" label="Produits"               value={stats?.totalProduits ?? 0}        link="/produits" />
            <StatCard icon={Package}      color="#7c3aed" bg="#ede9fe" label="Lots enregistrés"       value={stats?.totalLots ?? 0}            link="/produits" />
            <StatCard icon={TrendingUp}   color="#059669" bg="#d1fae5" label="Mouvements aujourd'hui" value={stats?.mouvementsAujourdhui ?? 0} link="/stock/historique" />
            <StatCard icon={Clock}        color="#d97706" bg="#fef3c7" label="Demandes en attente"    value={stats?.demandesEnAttente ?? 0}    link="/demandes/validation" />
          </div>
          <div style={styles.alertGrid}>
            <AlertCard icon={AlertTriangle} color="#e74c3c" bg="#fdecea" label="Produits en alerte stock"    value={stats?.produitsEnAlerte ?? 0}    link="/produits" />
            <AlertCard icon={CalendarClock} color="#e67e22" bg="#fef3e2" label="Lots périmant bientôt (60j)" value={stats?.lotsPerimantBientot ?? 0} link="/lots/peremption-proche" />
            <AlertCard icon={CheckCircle}   color="#27ae60" bg="#eafaf1" label="Demandes validées à traiter" value={stats?.demandesValidees ?? 0}    link="/demandes/traitement" />
          </div>
        </>
      )}
      <GraphiqueMouvements />
      <AlertesTables alertes={alertes} loadA={loadA} />
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Accès rapide</h3>
        <div style={styles.shortcutsGrid}>
          <Shortcut to="/lots/nouveau"        icon={PackagePlus}   label="Réceptionner un lot"   color="#2563eb" />
          <Shortcut to="/stock/historique"    icon={ClipboardList} label="Voir l'historique"      color="#7c3aed" />
          <Shortcut to="/produits"            icon={FlaskConical}  label="Gérer les produits"     color="#059669" />
          <Shortcut to="/demandes/validation" icon={CheckCircle}   label="Valider des demandes"   color="#d97706" />
          <Shortcut to="/demandes/traitement" icon={Truck}         label="Traiter des demandes"   color="#e67e22" />
          <Shortcut to="/utilisateurs"        icon={Users}         label="Gérer les utilisateurs" color="#e74c3c" />
        </div>
      </div>
    </>
  )
}

/* ─── Dashboard Magasinier ─── */
function DashboardMagasinier({ stats, alertes, loadS, loadA }) {
  return (
    <>
      {loadS ? <Spinner /> : (
        <>
          <div style={styles.statsGrid}>
            <StatCard icon={FlaskConical} color="#2563eb" bg="#e8f0fe" label="Produits en stock"      value={stats?.totalProduits ?? 0}    link="/produits" />
            <StatCard icon={Package}      color="#7c3aed" bg="#ede9fe" label="Lots enregistrés"       value={stats?.totalLots ?? 0}        link="/produits" />
            <StatCard icon={TrendingUp}   color="#059669" bg="#d1fae5" label="Mouvements aujourd'hui" value={stats?.mouvementsAujourdhui ?? 0} link="/stock/historique" />
            <StatCard icon={Truck}        color="#d97706" bg="#fef3c7" label="Demandes à distribuer"  value={stats?.demandesValidees ?? 0} link="/demandes/traitement" />
          </div>
          <div style={styles.alertGrid}>
            <AlertCard icon={AlertTriangle} color="#e74c3c" bg="#fdecea" label="Produits en alerte stock"    value={stats?.produitsEnAlerte ?? 0}    link="/produits" />
            <AlertCard icon={CalendarClock} color="#e67e22" bg="#fef3e2" label="Lots périmant bientôt (60j)" value={stats?.lotsPerimantBientot ?? 0} link="/lots/peremption-proche" />
          </div>
        </>
      )}
      <GraphiqueMouvements />
      <AlertesTables alertes={alertes} loadA={loadA} />
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Accès rapide</h3>
        <div style={styles.shortcutsGrid}>
          <Shortcut to="/lots/nouveau"           icon={PackagePlus}   label="Réceptionner un lot"  color="#2563eb" />
          <Shortcut to="/demandes/traitement"    icon={Truck}         label="Distribuer le stock"  color="#d97706" />
          <Shortcut to="/stock/historique"       icon={ClipboardList} label="Voir l'historique"     color="#7c3aed" />
          <Shortcut to="/lots/peremption-proche" icon={CalendarClock} label="Lots périmants"        color="#e67e22" />
        </div>
      </div>
    </>
  )
}

/* ─── Dashboard Major ─── */
function DashboardMajor({ stats, alertes, loadS, loadA }) {
  return (
    <>
      {loadS ? <Spinner /> : (
        <div style={styles.statsGrid}>
          <StatCard icon={Clock}         color="#d97706" bg="#fef3c7" label="Demandes en attente"  value={stats?.demandesEnAttente ?? 0}   link="/demandes/validation" />
          <StatCard icon={CheckCircle}   color="#059669" bg="#d1fae5" label="Demandes validées"    value={stats?.demandesValidees ?? 0}    link="/demandes/traitement" />
          <StatCard icon={AlertTriangle} color="#e74c3c" bg="#fdecea" label="Produits en alerte"   value={stats?.produitsEnAlerte ?? 0}    link="/produits" />
          <StatCard icon={CalendarClock} color="#e67e22" bg="#fef3e2" label="Lots périmants"       value={stats?.lotsPerimantBientot ?? 0} link="/lots/peremption-proche" />
        </div>
      )}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Accès rapide</h3>
        <div style={styles.shortcutsGrid}>
          <Shortcut to="/demandes/validation" icon={CheckCircle}   label="Valider les demandes"       color="#059669" />
          <Shortcut to="/produits"            icon={FlaskConical}  label="Consulter les produits"     color="#7c3aed" />
          <Shortcut to="/stock/historique"    icon={ClipboardList} label="Historique des mouvements"  color="#d97706" />
        </div>
      </div>
      {loadA ? <Spinner /> : alertes?.produitsEnAlerte?.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitleRow}>
            <AlertTriangle size={16} color="#e74c3c" />
            <h3 style={styles.sectionTitle}>Produits en stock faible</h3>
          </div>
          <table style={styles.table}>
            <thead><tr>{['Produit', 'Stock actuel', 'Seuil'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {alertes.produitsEnAlerte.slice(0, 5).map(p => (
                <tr key={p.id}>
                  <td style={styles.td}><Link to={`/produits/${p.id}`} style={{ color: '#1a3c5e', fontWeight: 600 }}>{p.nom}</Link></td>
                  <td style={{ ...styles.td, color: '#e74c3c', fontWeight: 700 }}>{p.stockTotal} {p.unite}</td>
                  <td style={styles.td}>{p.seuilAlerte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

/* ─── Dashboard Technicien ─── */
function DashboardTechnicien({ stats, loadS }) {
  return (
    <>
      {loadS ? <Spinner /> : (
        <div style={styles.statsGrid}>
          <StatCard icon={FileText}     color="#2563eb" bg="#e8f0fe" label="Mes demandes en attente" value={stats?.demandesEnAttente ?? 0} link="/demandes" />
          <StatCard icon={FlaskConical} color="#7c3aed" bg="#ede9fe" label="Produits disponibles"    value={stats?.totalProduits ?? 0}     link="/produits" />
        </div>
      )}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Accès rapide</h3>
        <div style={styles.shortcutsGrid}>
          <Shortcut to="/demandes"         icon={FileText}      label="Faire une demande"         color="#2563eb" />
          <Shortcut to="/produits"         icon={FlaskConical}  label="Consulter les produits"    color="#7c3aed" />
          <Shortcut to="/stock/historique" icon={ClipboardList} label="Historique des mouvements" color="#059669" />
        </div>
      </div>
    </>
  )
}

/* ─── Tables alertes partagées ─── */
function AlertesTables({ alertes, loadA }) {
  if (loadA) return <Spinner />
  return (
    <div style={styles.bottomGrid}>
      {alertes?.produitsEnAlerte?.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitleRow}><AlertTriangle size={16} color="#e74c3c" /><h3 style={styles.sectionTitle}>Stock faible</h3></div>
            <Link to="/produits" style={styles.seeAll}>Voir tout <ArrowRight size={13} /></Link>
          </div>
          <table style={styles.table}>
            <thead><tr>{['Produit', 'Stock', 'Seuil'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {alertes.produitsEnAlerte.slice(0, 5).map(p => (
                <tr key={p.id}>
                  <td style={styles.td}><Link to={`/produits/${p.id}`} style={{ color: '#1a3c5e', fontWeight: 600 }}>{p.nom}</Link></td>
                  <td style={{ ...styles.td, color: '#e74c3c', fontWeight: 700 }}>{p.stockTotal} {p.unite}</td>
                  <td style={styles.td}>{p.seuilAlerte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {alertes?.lotsPerimantBientot?.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitleRow}><CalendarClock size={16} color="#e67e22" /><h3 style={styles.sectionTitle}>Péremption proche</h3></div>
            <Link to="/lots/peremption-proche" style={styles.seeAll}>Voir tout <ArrowRight size={13} /></Link>
          </div>
          <table style={styles.table}>
            <thead><tr>{['Produit', 'N° Lot', 'Expire le', 'Qté'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {alertes.lotsPerimantBientot.slice(0, 5).map(l => (
                <tr key={l.id}>
                  <td style={styles.td}>{l.produitNom}</td>
                  <td style={styles.td}>{l.numeroLot}</td>
                  <td style={{ ...styles.td, color: '#e67e22', fontWeight: 600 }}>{l.datePeremption}</td>
                  <td style={styles.td}>{l.quantiteRestante}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Composants UI ─── */
function StatCard({ icon: Icon, color, bg, label, value, link }) {
  return (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div style={styles.statCard}>
        <div style={{ ...styles.statIcon, background: bg }}><Icon size={20} color={color} strokeWidth={2} /></div>
        <div style={{ ...styles.statValue, color }}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </Link>
  )
}

function AlertCard({ icon: Icon, color, bg, label, value, link }) {
  return (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div style={{ ...styles.alertCard, borderLeft: `4px solid ${color}` }}>
        <div style={{ ...styles.alertIcon, background: bg }}><Icon size={18} color={color} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ ...styles.alertValue, color }}>{value}</div>
          <div style={styles.alertLabel}>{label}</div>
        </div>
        <ArrowRight size={16} color="#ccc" />
      </div>
    </Link>
  )
}

function Shortcut({ to, icon: Icon, label, color }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={styles.shortcut}>
        <div style={{ ...styles.shortcutIcon, background: color + '18', color }}><Icon size={20} strokeWidth={1.8} /></div>
        <span style={styles.shortcutLabel}>{label}</span>
        <ArrowRight size={14} color="#ccc" />
      </div>
    </Link>
  )
}

function BarChart({ data }) {
  if (!data.length) return <div style={{ color: '#aaa', textAlign: 'center', padding: 24 }}>Aucune donnée sur cette période</div>
  const W = 700, H = 180, PAD = { top: 16, right: 16, bottom: 32, left: 36 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const maxVal = Math.max(...data.flatMap(d => [d.entrees, d.sorties]), 1)
  const barW = Math.max(4, (innerW / data.length) * 0.3)
  const gap = Math.max(2, (innerW / data.length) * 0.06)
  const scaleY = v => innerH - (v / maxVal) * innerH
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(r => ({ y: innerH * (1 - r), label: Math.round(maxVal * r) }))
  // N'afficher que N étiquettes max pour éviter la surcharge
  const labelStep = Math.ceil(data.length / 15)

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {gridLines.map(({ y, label }) => (
            <g key={y}>
              <line x1={0} y1={y} x2={innerW} y2={y} stroke="#e8ecf0" strokeWidth={1} />
              <text x={-6} y={y + 4} textAnchor="end" fontSize={10} fill="#aaa">{label}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const slotW = innerW / data.length
            const x = i * slotW + slotW * 0.1
            const hE = (d.entrees / maxVal) * innerH
            const hS = (d.sorties / maxVal) * innerH
            return (
              <g key={d.date}>
                <rect x={x} y={scaleY(d.entrees)} width={barW} height={hE} fill="#2563eb" rx={2} opacity={0.85} />
                <rect x={x + barW + gap} y={scaleY(d.sorties)} width={barW} height={hS} fill="#e74c3c" rx={2} opacity={0.85} />
                {i % labelStep === 0 && (
                  <text x={x + barW + gap / 2} y={innerH + 18} textAnchor="middle" fontSize={9} fill="#888">
                    {d.date.slice(5)}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 4 }}>
        <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#2563eb' }} /> Entrées</div>
        <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#e74c3c' }} /> Sorties</div>
      </div>
    </div>
  )
}

const styles = {
  welcomeRow: { marginBottom: 24 },
  welcome: { fontSize: 22, color: '#1a3c5e', margin: '0 0 6px' },
  roleBadge: { fontSize: 12, background: '#e8f0fe', color: '#2563eb', borderRadius: 20, padding: '3px 12px', fontWeight: 600 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 14 },
  statCard: { background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' },
  statIcon: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 32, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 5 },
  alertGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 },
  alertCard: { background: '#fff', borderRadius: 12, padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 },
  alertIcon: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertValue: { fontSize: 24, fontWeight: 700, lineHeight: 1 },
  alertLabel: { fontSize: 12, color: '#888', marginTop: 3 },
  section: { background: '#fff', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 18 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, color: '#1a3c5e', margin: '0 0 16px', fontWeight: 700 },
  seeAll: { display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2563eb', fontSize: 13, textDecoration: 'none' },
  graphHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  graphSub: { fontSize: 12, color: '#888', margin: '4px 0 0' },
  dateRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  dateLabel: { fontSize: 13, color: '#666' },
  dateInput: { padding: '6px 10px', border: '1.5px solid #e0e4ea', borderRadius: 8, fontSize: 13, outline: 'none', color: '#333' },
  btnApply: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnReset: { background: '#f1f3f5', color: '#444', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  bottomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 18 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '7px 10px', background: '#f5f7fa', fontSize: 12, color: '#666', borderBottom: '2px solid #e8ecf0' },
  td: { padding: '9px 10px', fontSize: 13, borderBottom: '1px solid #f0f2f5' },
  shortcutsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 },
  shortcut: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: '1px solid #e8ecf0', cursor: 'pointer', background: '#fafbfc' },
  shortcutIcon: { width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  shortcutLabel: { flex: 1, fontSize: 13, fontWeight: 600, color: '#333' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' },
  legendDot: { width: 10, height: 10, borderRadius: 2, display: 'inline-block' },
}
