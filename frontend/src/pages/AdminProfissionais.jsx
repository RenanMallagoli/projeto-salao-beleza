import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function AdminProfissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [mensagem, setMensagem] = useState('');
  const { token } = useAuth();
  
  // --- INÍCIO DO DIAGNÓSTICO ---
  console.log('1. Componente renderizou. O token disponível agora é:', token);
  // --- FIM DO DIAGNÓSTICO ---

  const fetchData = useCallback(async () => {
    if (!token) {
      console.log('2. fetchData chamado, mas parou porque não há token.');
      return;
    }
    
    console.log('2. fetchData chamado COM token. Iniciando busca de dados...');

    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      const [resProfissionais, resUsuarios] = await Promise.all([
        axios.get(`${apiUrl}/api/profissionais`),
        axios.get(`${apiUrl}/api/usuarios`, config)
      ]);
      
      // --- INÍCIO DO DIAGNÓSTICO ---
      console.log('3. DADOS RECEBIDOS DA API:', { 
        profissionais: resProfissionais.data, 
        usuarios: resUsuarios.data 
      });
      // --- FIM DO DIAGNÓSTICO ---

      setProfissionais(resProfissionais.data);
      setUsuarios(resUsuarios.data);
    } catch (error) {
      // --- INÍCIO DO DIAGNÓSTICO ---
      console.error('4. ERRO na chamada da API:', error);
      if (error.response) {
        console.error('Resposta do erro da API:', error.response.data);
      }
      // --- FIM DO DIAGNÓSTICO ---
      setMensagem('Erro ao carregar dados da página.');
    }
  }, [token]);

  useEffect(() => {
    console.log('Componente montou ou o token mudou, chamando fetchData.');
    fetchData();
  }, [fetchData]);

  // As funções handleSubmit e handleDelete continuam as mesmas...
  const handleSubmit = async (e) => { e.preventDefault(); /* ... */ };
  const handleDelete = async (id) => { /* ... */ };

  return (
    <article>
      <h2>Gerenciar Profissionais</h2>
      {/* O resto do seu JSX continua aqui... ele está correto. */}
      {/* ... */}
      <h3>Profissionais Atuais</h3>
      <table>
        {/* ... */}
        <tbody>
          {/* --- INÍCIO DO DIAGNÓSTICO --- */}
          {console.log('5. Renderizando a tabela. Número de profissionais no estado:', profissionais.length)}
          {/* --- FIM DO DIAGNÓSTICO --- */}
          {profissionais.map(prof => (
            <tr key={prof.id}>
              <td>{prof.usuario.nome}</td>
              <td>{prof.usuario.email}</td>
              <td>
                <div className="grid">
                  <Link to={`/admin/profissionais/${prof.id}/horarios`}>
                      <button>Horários</button>
                  </Link>
                  <button onClick={() => handleDelete(prof.id)} className="secondary">Deletar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

export default AdminProfissionais;