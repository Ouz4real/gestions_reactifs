import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const SIDEBAR_OPEN = 240
const SIDEBAR_CLOSED = 68

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? SIDEBAR_CLOSED : SIDEBAR_OPEN

  return (
    <div style={styles.shell}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div style={{ ...styles.content, marginLeft: sidebarW }}>
        <Topbar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <main style={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  content: {
    flex: 1, display: 'flex', flexDirection: 'column',
    minHeight: '100vh', transition: 'margin-left 0.25s ease',
  },
  main: { padding: '0 32px 28px', flex: 1 },
}
