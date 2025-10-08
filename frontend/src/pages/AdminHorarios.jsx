import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdminHorarios() {
  const { id } = useParams();
  const [profissional, setProfissional] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const { token } = useAuth();

  const [novoHorario, setNovoHorario] = useState({
    dia_da_semana: '1',
    hora_inicio: '09:00',
    hora_fim: '18:00',
  });

  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [resProfissional, resHorarios] = await Promise.all([
        axios.get(`${apiUrl}/api/profissionais/${id}`), 
        axios.get(`${apiUrl}/api/profissionais/${id}/horarios`, config) 
      ]);
      setProfissional(resProfissional.data);
      setHorarios(resHorarios.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setMensagem('Erro ao carregar dados.');
    }
  }, [id, token, apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoHorario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${apiUrl}/api/profissionais/${id}/horarios`, novoHorario, config);
      setMensagem('Horário adicionado com sucesso!');
      fetchData();
    } catch (error) {
      setMensagem(error.response?.data?.error || 'Erro ao adicionar horário.');
    }
  };

  const handleDelete = async (horarioId) => {
    if (!window.confirm('Tem certeza?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${apiUrl}/api/horarios/${horarioId}`, config);
      setMensagem('Horário removido com sucesso!');
      fetchData();
    } catch (error) {
      setMensagem(error.response?.data?.error || 'Erro ao remover horário.');
    }
  };

  const diasDaSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

  if (!profissional) return <article aria-busy="true">Carregando dados do profissional...</article>;

  return (
    <div className="container">
      <article>
        <nav>
          <ul>
            <li><Link to="/admin/profissionais">Voltar para Profissionais</Link></li>
          </ul>
        </nav>
        <h2>Gerenciar Horários de {profissional.usuario.nome}</h2>
        {mensagem && <p>{mensagem}</p>}

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Adicionar Novo Horário</legend>
            <div className="grid">
              <label>
                Dia da Semana
                <select name="dia_da_semana" value={novoHorario.dia_da_semana} onChange={handleInputChange}>
                  {diasDaSemana.map((dia, index) => (
                    <option key={index} value={index}>{dia}</option>
                  ))}
                </select>
              </label>
              <label>
                Hora de Início
                <input type="time" name="hora_inicio" value={novoHorario.hora_inicio} onChange={handleInputChange} />
              </label>
              <label>
                Hora de Fim
                <input type="time" name="hora_fim" value={novoHorario.hora_fim} onChange={handleInputChange} />
              </label>
            </div>
            <button type="submit">Adicionar Horário</button>
          </fieldset>
        </form>

        <h4>Horários Cadastrados</h4>
        <table>
          <thead>
            <tr>
              <th>Dia da Semana</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {horarios.map(h => (
              <tr key={h.id}>
                <td>{diasDaSemana[h.dia_da_semana]}</td>
                <td>{h.hora_inicio}</td>
                <td>{h.hora_fim}</td>
                <td>
                  <button onClick={() => handleDelete(h.id)} className="secondary" style={{ padding: '5px 10px', backgroundColor: 'var(--pico-color-red-500)'}}>
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </div>
  );
}

export default AdminHorarios;