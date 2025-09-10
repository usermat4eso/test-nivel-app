// En src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modulesWithStatus, setModulesWithStatus] = useState([]); // Estado para guardar los módulos con su estado

  useEffect(() => {
    const getStudentData = async () => {
      try {
        setLoading(true);
        const { user } = session;

        // --- PASO 1: OBTENER LOS MÓDULOS ASIGNADOS AL ALUMNO ---
        // Hacemos una consulta anidada para obtener los módulos a través de las relaciones de grupo
        const { data: modulesData, error: modulesError } = await supabase
          .from('student_group_relations')
          .select(`
            groups (
              group_module_relations (
                modules (
                  id,
                  name
                )
              )
            )
          `)
          .eq('student_id', user.id)
          .single();

        if (modulesError) throw modulesError;

        // Simplificamos la estructura de datos anidada a un array plano de módulos
        const assignedModules = modulesData?.groups?.group_module_relations.map(rel => rel.modules) || [];

        if (assignedModules.length === 0) {
          setModulesWithStatus([]); // Si no hay módulos, establecemos un array vacío
          return; // Salimos de la función
        }

        // --- PASO 2: OBTENER LOS INTENTOS DE TEST DEL ALUMNO ---
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('test_attempts')
          .select('module_id, score, completed_at')
          .eq('student_id', user.id);
        
        if (attemptsError) throw attemptsError;

        // --- PASO 3: COMBINAR LA INFORMACIÓN ---
        // Creamos un nuevo array que combina los módulos asignados con sus intentos correspondientes
        const combinedData = assignedModules.map(module => {
          const attempt = attemptsData.find(a => a.module_id === module.id);
          return {
            ...module, // Copiamos las propiedades del módulo (id, name)
            attempt: attempt || null, // Añadimos el objeto de intento, o null si no existe
          };
        });

        setModulesWithStatus(combinedData);

      } catch (error) {
        alert("Error al cargar los datos del dashboard: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    getStudentData();
  }, [session]); // El efecto se vuelve a ejecutar si la sesión cambia

  // RENDERIZADO CONDICIONAL
  if (loading) {
    return <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#555' }}>Cargando tu dashboard...</div>;
  }

  // RENDERIZADO PRINCIPAL
  return (
    <div style={{ width: '100%', maxWidth: '800px', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Mis Módulos</h2>
      
      {modulesWithStatus.length === 0 ? (
        <p>No tienes módulos asignados. Por favor, contacta con tu tutor.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {modulesWithStatus.map((module) => (
            <li key={module.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid #ddd',
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '4px'
            }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{module.name}</h3>
                {module.attempt ? (
                  // Si el test ha sido realizado
                  <p style={{ margin: 0, color: '#555' }}>
                    Realizado el: {new Date(module.attempt.completed_at).toLocaleDateString()} - 
                    <strong> Nota: {module.attempt.score}/100</strong>
                  </p>
                ) : (
                  // Si el test está pendiente
                  <p style={{ margin: 0, color: '#e67e22' }}>
                    <strong>Estado: Pendiente de realizar</strong>
                  </p>
                )}
              </div>
              <div>
                {module.attempt ? (
                  // Botón para revisar resultados (funcionalidad futura)
                  <button 
                    onClick={() => alert(`Funcionalidad de revisión para el módulo ${module.id} pendiente.`)}
                    style={{ padding: '8px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Revisar
                  </button>
                ) : (
                  // Botón para empezar el test
                  <button 
                    onClick={() => navigate(`/test/${module.id}`)}
                    style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Empezar Test
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}