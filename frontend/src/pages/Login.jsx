import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import ErrorMsg from '../components/ErrorMsg'

export default function Login() {
  const { register, handleSubmit } = useForm()
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setError(null)
    setLoading(true)
    try {
      const res = await login(data)
      const { token, ...userData } = res.data
      loginUser(userData, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧪 Réactifs UASZ</h1>
        <p style={styles.subtitle}>Gestion des réactifs et consommables</p>
        {error && <ErrorMsg error={error} />}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email"
              {...register('email', { required: true })} placeholder="admin@uasz.sn" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input style={styles.input} type="password"
              {...register('motDePasse', { required: true })} placeholder="••••••••" />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center',
    justifyContent:'center', background:'#1a3c5e' },
  card: { background:'#fff', borderRadius:12, padding:40, width:380,
    boxShadow:'0 8px 32px rgba(0,0,0,0.2)' },
  title: { textAlign:'center', color:'#1a3c5e', marginBottom:4, fontSize:24 },
  subtitle: { textAlign:'center', color:'#888', marginBottom:28, fontSize:14 },
  field: { marginBottom:16 },
  label: { display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:'#444' },
  input: { width:'100%', padding:'10px 12px', border:'1px solid #ddd',
    borderRadius:6, fontSize:14, boxSizing:'border-box' },
  btn: { width:'100%', padding:'12px', background:'#1a3c5e', color:'#fff',
    border:'none', borderRadius:6, fontSize:15, fontWeight:600,
    cursor:'pointer', marginTop:8 },
}
