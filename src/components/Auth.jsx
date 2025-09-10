// En src/components/Auth.jsx
import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault() // Evita que la página se recargue al enviar el formulario

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      alert('¡Revisa tu correo para encontrar el enlace de inicio de sesión!')
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '320px', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
      <h1 style={{ textAlign: 'center' }}>Plataforma de Tests</h1>
      <p style={{ textAlign: 'center' }}>Inicia sesión con tu email corporativo</p>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="tu.email@centro.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '1rem' }}
          required
        />
        <button 
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Enviando...' : 'Enviar Magic Link'}
        </button>
      </form>
    </div>
  )
}