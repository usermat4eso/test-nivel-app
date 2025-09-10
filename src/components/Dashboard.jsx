// En src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Recibimos la sesión del usuario como prop para saber quién es
export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    // Función asíncrona para cargar los datos
    const getModulesForStudent = async () => {
      try {
        setLoading(true);
        const { user } = session; // Obtenemos el usuario de la sesión

        // Esta es la consulta compleja para obtener los módulos del alumno.
        // Supabase permite hacer "joins" encadenados de forma muy legible.
        const { data, error } = await supabase
          .from('student_group_relations') // 1. Empezamos en la tabla que relaciona alumnos y grupos
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
          .eq('student_id', user.id) // 2. Filtramos por el ID del alumno actual
          .single(); // Esperamos un único resultado (un alumno solo pertenece a un grupo en este modelo)

        if (error) throw error;
        
        // La estructura de datos que devuelve Supabase está anidada.
        // Necesitamos simplificarla a un array plano de módulos.
        if (data && data.groups && data.groups.group_module_relations) {
          const studentModules = data.groups.group_module_relations.map(
            (rel) => rel.modules
          );
          setModules(studentModules);
        }

      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    getModulesForStudent();
  }, [session]); // El efecto se ejecuta cada vez que la sesión cambie

  if (loading) {
    return <div>Cargando tus módulos...</div>;
  }

  return (
    <div style={{ width: '500px', padding: '2rem', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>Mis Módulos</h2>
      {modules.length === 0 ? (
        <p>No tienes módulos asignados. Contacta con tu tutor.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {modules.map((module) => (
            <li key={module.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
              <h3>{module.name}</h3>
              <p>Estado: Pendiente</p>
              <button style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                Empezar Test
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}