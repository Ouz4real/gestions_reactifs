export default function ErrorMsg({ error }) {
  const msg = error?.response?.data?.message || error?.message || 'Une erreur est survenue'
  return (
    <div style={{
      background: '#fdecea', border: '1px solid #e74c3c', borderRadius: 6,
      padding: '10px 16px', color: '#c0392b', marginBottom: 16
    }}>
      {msg}
    </div>
  )
}
