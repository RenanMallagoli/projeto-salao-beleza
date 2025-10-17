import React from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [mensagem, setMensagem] = React.useState('');
  const { user, token } = useAuth();
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchAgendamentos = React.useCallback(async () => {
    if (!user || !token || user.tipo === 'ADMIN') {
        setLoading(false);
        return;
    };

    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    const url = user.tipo === 'CLIENTE'
      ? `${apiUrl}/api/meus-agendamentos`
      : `${apiUrl}/api/profissionais/meus-agendamentos`;

    try {
      const response = await axios.get(url, config);
      setAgendamentos(response.data);
      setError('');
    } catch (err) {
      setError('Não foi possível carregar os agendamentos.');
      console.error("Erro detalhado ao buscar agendamentos:", err); // Log para depuração
    } finally {
      setLoading(false);
    }
  }, [user, token, apiUrl]);

  React.useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  const handleCancel = async (agendamentoId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`${apiUrl}/api/agendamentos/${agendamentoId}`, config);

      setMensagem('Agendamento cancelado com sucesso!');
      fetchAgendamentos();
    } catch (err) {
      setMensagem('Erro ao cancelar o agendamento.');
      console.error("Erro detalhado ao cancelar:", err);
    }
  };

  if (user?.tipo === 'ADMIN') {
    return null;
  }

  if (loading) return <div className="container" style={{padding: '20px'}}><article aria-busy="true">Carregando agendamentos...</article></div>;
  if (error) return <div className="container" style={{padding: '20px'}}><p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p></div>;

  return (
    <div className="container">
      <article>
        <h2>Meus Agendamentos</h2>
        {mensagem && <p>{mensagem}</p>}
        {agendamentos.length === 0 ? (
          <p>Você não possui agendamentos.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {agendamentos.map(ag => (
              <div key={ag.id} style={{ border: '1px solid var(--cor-borda)', padding: '15px', borderRadius: '8px' }}>
                <h4>{ag.servico.nome}</h4>
                <p>
                  <strong>Data:</strong> {new Date(ag.data_hora_inicio).toLocaleDateString('pt-BR')}
                </p>
                <p>
                  <strong>Horário:</strong> {new Date(ag.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {user.tipo === 'CLIENTE' && ag.profissional?.usuario && (
                  <p><strong>Profissional:</strong> {ag.profissional.usuario.nome}</p>
                )}
                {user.tipo === 'PROFISSIONAL' && ag.cliente && (
                  <p><strong>Cliente:</strong> {ag.cliente.nome} ({ag.cliente.email})</p>
                )}
                
                <button 
                  onClick={() => handleCancel(ag.id)} 
                  className="secondary" 
                  style={{ marginTop: '10px' }}
                >
                  Cancelar Agendamento
                </button>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

export default MeusAgendamentos;