export default function AlerteBadge({ count, label }) {
  if (!count) return null
  return (
    <span style={{
      background: '#e74c3c', color: '#fff', borderRadius: 12,
      padding: '2px 10px', fontSize: 12, fontWeight: 700, marginLeft: 8
    }}>
      {count} {label}
    </span>
  )
}
