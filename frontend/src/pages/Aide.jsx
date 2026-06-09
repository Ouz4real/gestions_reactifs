import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HelpCircle, FlaskConical, FileText, CheckSquare, Truck,
  PackagePlus, CalendarClock, Users, ShieldCheck, ChevronDown, ChevronUp,
  ArrowRight,
} from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../auth/AuthContext'

const GUIDES = {
  ROLE_TECHNICIEN: {
    label: 'Technicien de laboratoire',
    color: '#27ae60',
    bg: '#eafaf1',
    icon: FlaskConical,
    intro: 'En tant que technicien, votre rôle est de consulter les stocks disponibles et de faire des demandes de réactifs pour vos analyses.',
    sections: [
      {
        title: 'Consulter les produits disponibles',
        icon: FlaskConical,
        color: '#2563eb',
        steps: [
          'Cliquez sur "Produits" dans la barre latérale.',
          'La liste affiche tous les réactifs et consommables avec leur stock actuel.',
          'Un badge rouge "Alerte" indique les produits en stock faible.',
          'Cliquez sur le nom d\'un produit pour voir ses lots et son historique.',
        ],
        link: { to: '/produits', label: 'Aller aux Produits' },
      },
      {
        title: 'Faire une demande de réactif',
        icon: FileText,
        color: '#e67e22',
        steps: [
          'Cliquez sur "Mes demandes" dans la barre latérale.',
          'Cliquez sur le bouton "+ Nouvelle demande".',
          'Sélectionnez le produit souhaité dans la liste déroulante.',
          'Indiquez la quantité nécessaire.',
          'Ajoutez un motif (ex: "Analyses NFS semaine 20") pour justifier la demande.',
          'Cliquez sur "Envoyer" — votre demande est transmise au Major.',
        ],
        link: { to: '/demandes', label: 'Aller à Mes demandes' },
      },
      {
        title: 'Suivre l\'état de vos demandes',
        icon: CheckSquare,
        color: '#7c3aed',
        steps: [
          'Dans "Mes demandes", chaque ligne affiche le statut de votre demande.',
          '"En attente" : le Major n\'a pas encore statué.',
          '"Validée" : le Major a approuvé, le Magasinier va distribuer.',
          '"Traitée" : le stock a été distribué, vous pouvez récupérer votre réactif.',
          '"Rejetée" : le Major a refusé — consultez le commentaire pour savoir pourquoi.',
          'Cliquez sur "Voir détails" pour afficher toutes les informations de la demande.',
        ],
        link: { to: '/demandes', label: 'Voir mes demandes' },
      },
    ],
  },

  ROLE_MAJOR: {
    label: 'Major / Chef de service',
    color: '#e67e22',
    bg: '#fef3e2',
    icon: CheckSquare,
    intro: 'En tant que Major, votre rôle est de valider ou rejeter les demandes des techniciens avant qu\'elles soient traitées par le Magasinier.',
    sections: [
      {
        title: 'Valider ou rejeter une demande',
        icon: CheckSquare,
        color: '#27ae60',
        steps: [
          'Cliquez sur "Validation" dans la barre latérale.',
          'Vous voyez toutes les demandes en attente de validation.',
          'Chaque carte affiche le produit, la quantité, le demandeur et le motif.',
          'Ajoutez un commentaire optionnel pour expliquer votre décision.',
          'Cliquez sur "Valider" (vert) pour approuver la demande.',
          'Cliquez sur "Rejeter" (rouge) pour refuser — le technicien sera informé.',
        ],
        link: { to: '/demandes/validation', label: 'Aller à Validation' },
      },
      {
        title: 'Consulter les produits et leur stock',
        icon: FlaskConical,
        color: '#2563eb',
        steps: [
          'Cliquez sur "Produits" dans la barre latérale.',
          'Vous pouvez voir le stock actuel de chaque réactif.',
          'Les produits en alerte (stock ≤ seuil) sont signalés en rouge.',
          'Cliquez sur un produit pour voir ses lots actifs et l\'historique.',
        ],
        link: { to: '/produits', label: 'Aller aux Produits' },
      },
      {
        title: 'Consulter l\'historique des mouvements',
        icon: FileText,
        color: '#7c3aed',
        steps: [
          'Cliquez sur "Historique" dans la barre latérale.',
          'Vous voyez tous les mouvements d\'entrée et de sortie de stock.',
          'Utilisez la barre de recherche pour filtrer par produit ou motif.',
          'Filtrez par type : "Entrées" ou "Sorties".',
          'Cliquez sur "Voir détails" pour afficher toutes les informations d\'un mouvement.',
        ],
        link: { to: '/stock/historique', label: 'Aller à l\'Historique' },
      },
    ],
  },

  ROLE_MAGASINIER: {
    label: 'Magasinier / Chef des services généraux',
    color: '#2563eb',
    bg: '#e8f0fe',
    icon: PackagePlus,
    intro: 'En tant que Magasinier, vous gérez les entrées de stock (réceptions) et les sorties (distributions). Le système applique automatiquement la règle FIFO.',
    sections: [
      {
        title: 'Réceptionner un lot',
        icon: PackagePlus,
        color: '#2563eb',
        steps: [
          'Cliquez sur "Réception" dans la barre latérale.',
          'Sélectionnez le produit concerné dans la liste.',
          'Renseignez le numéro de lot (ex: LOT-GLY-001).',
          'Indiquez les dates : fabrication, péremption, acquisition.',
          'Saisissez la quantité reçue.',
          'Ajoutez le numéro de bon de commande dans "Motif".',
          'Cliquez sur "Enregistrer le lot" — un mouvement d\'entrée est automatiquement créé.',
        ],
        link: { to: '/lots/nouveau', label: 'Réceptionner un lot' },
      },
      {
        title: 'Distribuer le stock (FIFO)',
        icon: Truck,
        color: '#e67e22',
        steps: [
          'Cliquez sur "Traitement" dans la barre latérale.',
          'Vous voyez les demandes validées par le Major en attente de distribution.',
          'Vérifiez le produit, la quantité et le demandeur.',
          'Cliquez sur "Distribuer (FIFO)" — le système consomme automatiquement les lots les plus anciens en premier.',
          'Un mouvement de sortie est enregistré pour chaque lot consommé.',
        ],
        link: { to: '/demandes/traitement', label: 'Aller au Traitement' },
      },
      {
        title: 'Surveiller les alertes stock',
        icon: FlaskConical,
        color: '#e74c3c',
        steps: [
          'Le Dashboard affiche les produits dont le stock est inférieur au seuil d\'alerte.',
          'Cliquez sur la card "Produits en alerte stock" pour voir la liste.',
          'Planifiez une commande fournisseur pour les produits concernés.',
        ],
        link: { to: '/dashboard', label: 'Voir le Dashboard' },
      },
      {
        title: 'Surveiller les lots périmants',
        icon: CalendarClock,
        color: '#e67e22',
        steps: [
          'Cliquez sur "Péremption" dans la barre latérale.',
          'Vous voyez tous les lots qui expirent dans les 60 prochains jours.',
          'Les lots "Urgent" (≤ 30 jours) sont signalés en rouge.',
          'Priorisez la consommation de ces lots pour éviter les pertes.',
        ],
        link: { to: '/lots/peremption-proche', label: 'Voir les lots périmants' },
      },
    ],
  },

  ROLE_ADMIN: {
    label: 'Administrateur système',
    color: '#e74c3c',
    bg: '#fdecea',
    icon: ShieldCheck,
    intro: 'En tant qu\'Administrateur, vous gérez les utilisateurs, les produits et supervisez l\'ensemble du système.',
    sections: [
      {
        title: 'Créer et gérer les utilisateurs',
        icon: Users,
        color: '#2563eb',
        steps: [
          'Cliquez sur "Utilisateurs" dans la barre latérale.',
          'Cliquez sur "+ Nouvel utilisateur" pour créer un compte.',
          'Renseignez nom, prénom, email, mot de passe et rôle.',
          'Pour modifier un utilisateur, cliquez sur l\'icône crayon (✏️).',
          'Pour activer/désactiver un compte, cliquez sur l\'icône Power (⏻).',
          'Pour supprimer un utilisateur, cliquez sur l\'icône corbeille (🗑️).',
        ],
        link: { to: '/utilisateurs', label: 'Gérer les utilisateurs' },
      },
      {
        title: 'Gérer les produits',
        icon: FlaskConical,
        color: '#7c3aed',
        steps: [
          'Cliquez sur "Produits" dans la barre latérale.',
          'Cliquez sur "+ Nouveau produit" pour ajouter un réactif ou consommable.',
          'Renseignez le nom, la catégorie (REACTIF/CONSOMMABLE), le type, l\'unité et le seuil d\'alerte.',
          'Pour modifier un produit, cliquez sur l\'icône crayon.',
          'Pour supprimer un produit, cliquez sur l\'icône corbeille.',
        ],
        link: { to: '/produits', label: 'Gérer les produits' },
      },
      {
        title: 'Superviser le système',
        icon: ShieldCheck,
        color: '#e74c3c',
        steps: [
          'Le Dashboard affiche une vue globale : produits, lots, mouvements du jour, demandes.',
          'Les alertes stock et péremption sont visibles en temps réel.',
          'Le graphique montre les entrées et sorties des 7 derniers jours.',
          'L\'historique complet est accessible via "Historique".',
          'Vous avez accès à toutes les sections de l\'application.',
        ],
        link: { to: '/dashboard', label: 'Voir le Dashboard' },
      },
    ],
  },
}

export default function Aide() {
  const { user } = useAuth()
  const [openSection, setOpenSection] = useState(0)

  const guide = GUIDES[user?.role]
  if (!guide) return null

  const Icon = guide.icon

  return (
    <Layout>
      {/* En-tête */}
      <div style={styles.header}>
        <div style={{ ...styles.iconWrap, background: guide.bg }}>
          <HelpCircle size={24} color={guide.color} />
        </div>
        <div>
          <h2 style={styles.title}>Aide & Support</h2>
          <p style={styles.subtitle}>Guide d'utilisation pour <strong>{guide.label}</strong></p>
        </div>
      </div>

      {/* Intro */}
      <div style={{ ...styles.introBox, borderLeft: `4px solid ${guide.color}`, background: guide.bg }}>
        <Icon size={18} color={guide.color} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ ...styles.introText, color: guide.color }}>{guide.intro}</p>
      </div>

      {/* Sections accordéon */}
      <div style={styles.sections}>
        {guide.sections.map((section, i) => {
          const SIcon = section.icon
          const isOpen = openSection === i
          return (
            <div key={i} style={styles.card}>
              {/* En-tête section */}
              <button
                style={styles.cardHeader}
                onClick={() => setOpenSection(isOpen ? null : i)}
              >
                <div style={styles.cardHeaderLeft}>
                  <div style={{ ...styles.stepIcon, background: section.color + '18', color: section.color }}>
                    <SIcon size={18} />
                  </div>
                  <span style={styles.cardTitle}>{section.title}</span>
                </div>
                {isOpen
                  ? <ChevronUp size={18} color="#888" />
                  : <ChevronDown size={18} color="#888" />}
              </button>

              {/* Contenu */}
              {isOpen && (
                <div style={styles.cardBody}>
                  <ol style={styles.stepList}>
                    {section.steps.map((step, j) => (
                      <li key={j} style={styles.stepItem}>
                        <span style={{ ...styles.stepNum, background: section.color }}>{j + 1}</span>
                        <span style={styles.stepText}>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {section.link && (
                    <Link to={section.link.to} style={{ ...styles.linkBtn, background: section.color }}>
                      {section.link.label} <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Contact */}
      <div style={styles.contact}>
        <HelpCircle size={16} color="#888" />
        <span style={styles.contactText}>
          Pour toute question technique, contactez l'administrateur système de l'UFR des Sciences de la Santé — UASZ.
        </span>
      </div>
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 },
  iconWrap: { width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: 22, color: '#1a3c5e', margin: '0 0 4px' },
  subtitle: { fontSize: 14, color: '#666', margin: 0 },
  introBox: { display: 'flex', alignItems: 'flex-start', gap: 12, borderRadius: 10, padding: '14px 18px', marginBottom: 24 },
  introText: { fontSize: 14, margin: 0, lineHeight: 1.6, fontWeight: 500 },
  sections: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 },
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  cardHeader: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
  cardHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  stepIcon: { width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1a3c5e' },
  cardBody: { padding: '0 20px 20px' },
  stepList: { margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 },
  stepItem: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  stepNum: { width: 22, height: 22, borderRadius: '50%', color: '#fff', fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepText: { fontSize: 14, color: '#444', lineHeight: 1.5 },
  linkBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff',
    borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' },
  contact: { display: 'flex', alignItems: 'center', gap: 8, background: '#f5f7fa',
    borderRadius: 10, padding: '12px 16px' },
  contactText: { fontSize: 13, color: '#666' },
}
