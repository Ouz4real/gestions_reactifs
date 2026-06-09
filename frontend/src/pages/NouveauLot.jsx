import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { ArrowLeft, PackagePlus } from 'lucide-react'
import { getProduits } from '../api/produits'
import { createLot } from '../api/lots'
import Layout from '../components/Layout'
import ErrorMsg from '../components/ErrorMsg'

export default function NouveauLot() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)
  const { register, handleSubmit } = useForm({
    defaultValues: { produitId: searchParams.get('produitId') || '' }
  })

  const { data: produits = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: () => getProduits().then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: createLot,
    onSuccess: (res) => navigate(`/produits/${res.data.produitId}`),
    onError: setError,
  })

  const onSubmit = (data) => mutation.mutate({
    ...data,
    produitId: Number(data.produitId),
    quantiteInitiale: Number(data.quantiteInitiale),
  })

  return (
    <Layout>
      <div style={styles.container}>
        <button style={styles.back} onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Retour
        </button>
        <div style={styles.titleRow}>
          <PackagePlus size={22} color="#2563eb" />
          <h2 style={styles.title}>Réceptionner un lot</h2>
        </div>
        {error && <ErrorMsg error={error} />}
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <Field label="Produit *">
            <select style={styles.input} {...register('produitId', { required: true })}>
              <option value="">-- Sélectionner un produit --</option>
              {produits.map(p => (
                <option key={p.id} value={p.id}>{p.nom} ({p.categorie})</option>
              ))}
            </select>
          </Field>
          <Field label="Numéro de lot *">
            <input style={styles.input} {...register('numeroLot', { required: true })} placeholder="ex: LOT-2024-001" />
          </Field>
          <div style={styles.row}>
            <Field label="Date de fabrication">
              <input style={styles.input} type="date" {...register('dateFabrication')} />
            </Field>
            <Field label="Date de péremption *">
              <input style={styles.input} type="date" {...register('datePeremption', { required: true })} />
            </Field>
          </div>
          <div style={styles.row}>
            <Field label="Date d'acquisition *">
              <input style={styles.input} type="date" {...register('dateAcquisition', { required: true })} />
            </Field>
            <Field label="Quantité *">
              <input style={styles.input} type="number" min="1" {...register('quantiteInitiale', { required: true })} />
            </Field>
          </div>
          <Field label="Motif / Référence commande">
            <input style={styles.input} {...register('motif')} placeholder="ex: Bon de commande N°..." />
          </Field>
          <div style={styles.actions}>
            <button type="button" style={styles.btnSecondary} onClick={() => navigate(-1)}>Annuler</button>
            <button type="submit" style={styles.btnPrimary} disabled={mutation.isPending}>
              <PackagePlus size={15} />
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer le lot'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16, flex: 1 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

const styles = {
  container: { maxWidth: 600, margin: '0 auto' },
  back: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer',
    fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12, padding: 0 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  title: { fontSize: 22, color: '#1a3c5e', margin: 0 },
  form: { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  row: { display: 'flex', gap: 16 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e0e4ea',
    borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  btnPrimary: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
    display: 'flex', alignItems: 'center', gap: 6 },
  btnSecondary: { background: '#f1f3f5', color: '#444', border: 'none', borderRadius: 8,
    padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14 },
}
