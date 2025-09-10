// En src/App.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard' // <-- 1. Importar

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Añadimos un contenedor principal para centrar el contenido
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem'
    }}>
      {!session ? (
        <Auth />
      ) : (
        <>
          {/* Mostramos el email y el botón de logout en la parte superior */}
          <div style={{ width: '500px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span>Sesión iniciada como: <strong>{session.user.email}</strong></span>
            <button 
              onClick={() => supabase.auth.signOut()} 
              style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cerrar Sesión
            </button>
          </div>
          {/* Pasamos la sesión completa al Dashboard */}
          <Dashboard key={session.user.id} session={session} />
        </>
      )}
    </div>
  )
}

export default App