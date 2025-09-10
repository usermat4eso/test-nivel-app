// En src/components/ResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ResultsPage() {
    const { attemptId } = useParams(); // Obtenemos el ID del intento de la URL
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('test_attempts')
                    .select(`
                        score,
                        completed_at,
                        modules (
                            name
                        )
                    `)
                    .eq('id', attemptId)
                    .single(); // Esperamos un único resultado

                if (error) throw error;

                if (!data) {
                    throw new Error("No se encontraron los resultados para este test.");
                }
                setResult(data);
            } catch (error) {
                alert(error.message);
                navigate('/'); // Si hay error, volver al dashboard
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [attemptId, navigate]);

    if (loading) {
        return <div>Cargando tus resultados...</div>;
    }

    if (!result) {
        return <div>Resultados no encontrados.</div>;
    }

    return (
        <div style={{ width: '100%', maxWidth: '600px', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h1 style={{ color: '#28a745' }}>¡Test Completado!</h1>
            <p style={{ fontSize: '1.2rem' }}>Resultados para el módulo:</p>
            <h2 style={{ marginBottom: '2rem' }}>{result.modules.name}</h2>
            
            <div style={{ border: '2px solid #007bff', borderRadius: '50%', width: '150px', height: '150px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: '#555' }}>Tu nota</span>
                <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#007bff' }}>{result.score}</span>
                <span style={{ fontSize: '1.2rem', color: '#555' }}>/ 100</span>
            </div>
            
            <p style={{ marginTop: '2rem', color: '#777' }}>
                Completado el: {new Date(result.completed_at).toLocaleString()}
            </p>

            <Link to="/">
                <button style={{ marginTop: '1rem', padding: '12px 24px', fontSize: '1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Volver al Dashboard
                </button>
            </Link>
        </div>
    );
}