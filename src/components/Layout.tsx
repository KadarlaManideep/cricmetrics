import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

type Props = { children: React.ReactNode }

const Layout: React.FC<Props> = ({ children }) => (
  <>
    <Navbar />
    <Sidebar />
    <main style={{
      marginLeft: 220,
      marginTop: 56,
      minHeight: 'calc(100vh - 56px)',
      background: '#F4F6FA',
    }}>
      <div className="app-container">
        {children}
      </div>
    </main>
  </>
)

export default Layout
