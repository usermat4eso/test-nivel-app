// En src/App.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth' 

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Obtenemos la sesión actual al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escuchamos cambios en el estado de autenticación (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Limpiamos la suscripción cuando el componente se desmonta
    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    
    return (<Auth />) // Si no hay sesión, mostramos el componente de autenticación
  } else {
    // Si hay sesión, mostramos el Dashboard (o un mensaje de bienvenida)
    return (
      <div>
        <h2>¡Bienvenido!</h2>
        <p>Email: {session.user.email}</p>
        <button onClick={() => supabase.auth.signOut()}>
          Cerrar Sesión
        </button>
      </div>
    )
  }
}

export default App