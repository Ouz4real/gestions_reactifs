import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    // Afficher : première, dernière, page courante ±1, et ellipses
    if (
      i === 1 || i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div style={styles.wrap}>
      <button
        style={{ ...styles.btn, ...(page === 1 ? styles.btnDisabled : {}) }}
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={styles.ellipsis}>…</span>
        ) : (
          <button
            key={p}
            style={{ ...styles.btn, ...(p === page ? styles.btnActive : {}) }}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        style={{ ...styles.btn, ...(page === totalPages ? styles.btnDisabled : {}) }}
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    gap: 4, padding: '14px 16px', borderTop: '1px solid #f0f2f5',
  },
  btn: {
    minWidth: 32, height: 32, borderRadius: 6, border: '1px solid #e0e4ea',
    background: '#fff', color: '#444', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 6px',
  },
  btnActive: {
    background: '#2563eb', color: '#fff', border: '1px solid #2563eb', fontWeight: 700,
  },
  btnDisabled: {
    opacity: 0.35, cursor: 'not-allowed',
  },
  ellipsis: { color: '#aaa', fontSize: 13, padding: '0 4px' },
}
