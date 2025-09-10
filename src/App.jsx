// En src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import TestPage from './components/TestPage'; 
import ResultsPage from './components/ResultsPage';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
        {/* Mostramos la cabecera solo si hay sesión */}
        {session && (
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span>Sesión: <strong>{session.user.email}</strong></span>
            <button 
              onClick={() => supabase.auth.signOut()} 
              style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
        
        <Routes>
          {/* Ruta de Login: Si no hay sesión, muestra Auth. Si hay, redirige al Dashboard. */}
          <Route path="/login" element={!session ? <Auth /> : <Navigate to="/" />} />
          
          {/* Ruta del Dashboard: Protegida. Si no hay sesión, redirige a /login. */}
          <Route path="/" element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} />
          
          {/* Ruta del Test: También protegida. */}
          {/* <Route path="/test/:moduleId" element={session ? <TestPage session={session} /> : <Navigate to="/login" />} /> */}

          {/* Redirección por defecto si ninguna ruta coincide */}
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/test/:moduleId" element={session ? <TestPage session={session} /> : <Navigate to="/login" />} /> 
           <Route path="/results/:attemptId" element={session ? <ResultsPage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;