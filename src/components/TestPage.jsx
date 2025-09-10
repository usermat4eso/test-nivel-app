// En src/components/TestPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Función de utilidad para barajar un array (Algoritmo Fisher-Yates)
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function TestPage({ session }) {
  // HOOKS
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // ESTADOS
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el proceso de guardado

  // EFECTO PARA CARGAR LAS PREGUNTAS
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('questions')
          .select('id, question_text, options')
          .eq('module_id', moduleId);

        if (error) throw error;
        
        setQuestions(shuffleArray(data));

      } catch (error) {
        alert("Error al cargar las preguntas: " + error.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [moduleId, navigate]);

  // MEMORIZACIÓN DE OPCIONES BARAJADAS
  const shuffledOptions = useMemo(() => {
    if (!questions[currentQuestionIndex]) return { options: [], correctAnswer: '' };

    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.options[0];
    const options = shuffleArray(currentQuestion.options);
    
    return { options, correctAnswer };
  }, [questions, currentQuestionIndex]);

  // MANEJADOR DE SELECCIÓN DE RESPUESTA
  const handleAnswerSelect = (selectedOption) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === shuffledOptions.correctAnswer;
    
    const newAnswer = {
      question_id: currentQuestion.id,
      selected_answer_text: selectedOption,
      is_correct: isCorrect,
    };

    setUserAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(a => a.question_id === currentQuestion.id);
      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      }
      return [...prevAnswers, newAnswer];
    });
  };

  // MANEJADOR DE BOTÓN SIGUIENTE/FINALIZAR
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      handleFinishTest();
    }
  };

  // FUNCIÓN PARA FINALIZAR Y GUARDAR EL TEST
  const handleFinishTest = async () => {
    const isConfirmed = window.confirm("¿Estás seguro de que quieres finalizar y enviar tus respuestas? No podrás volver a realizar este test.");
    
    if (isConfirmed) {
      try {
        setIsSubmitting(true);

        // Llamamos a la función RPC que creamos en Supabase
        const { data, error } = await supabase.rpc('submit_test_results', {
          p_module_id: Number(moduleId), // Aseguramos que el ID es un número
          p_answers: userAnswers,
        });

        if (error) throw error;

        // data contiene { attempt_id, score } devuelto por la función
        alert(`¡Test guardado con éxito! Tu puntuación: ${data.score}/100`);

        // Navegamos a la página de resultados con el ID del intento
        navigate(`/results/${data.attempt_id}`);

      } catch (error) {
        alert("Error al guardar tus resultados: " + error.message);
        setIsSubmitting(false); // Importante re-habilitar los botones si hay un error
      }
    }
  };

  // RENDERIZADO CONDICIONAL
  if (loading) {
    return <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#555' }}>Cargando test...</div>;
  }
  
  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p>No se encontraron preguntas para este módulo.</p>
        <button onClick={() => navigate('/')}>Volver al Dashboard</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswerForCurrentQuestion = userAnswers.find(a => a.question_id === currentQuestion.id)?.selected_answer_text;

  // RENDERIZADO PRINCIPAL
  return (
    <div style={{ width: '100%', maxWidth: '800px', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2>Test en curso...</h2>
        <p>Pregunta <strong>{currentQuestionIndex + 1}</strong> de <strong>{questions.length}</strong></p>
      </div>
      
      <div style={{ margin: '2rem 0', padding: '1rem', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
        <h3 style={{ fontSize: '1.2rem', minHeight: '3em' }}>{currentQuestion.question_text}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
          {shuffledOptions.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={isSubmitting} // Deshabilitado mientras se guarda
              style={{
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                textAlign: 'left',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                backgroundColor: selectedAnswerForCurrentQuestion === option ? '#d4edda' : 'white',
                fontWeight: selectedAnswerForCurrentQuestion === option ? 'bold' : 'normal',
                transition: 'background-color 0.2s',
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleNextQuestion}
          disabled={!selectedAnswerForCurrentQuestion || isSubmitting}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            backgroundColor: (!selectedAnswerForCurrentQuestion || isSubmitting) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!selectedAnswerForCurrentQuestion || isSubmitting) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {isSubmitting 
            ? 'Guardando...' 
            : (currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Finalizar Test')}
        </button>
      </div>
    </div>
  );
}