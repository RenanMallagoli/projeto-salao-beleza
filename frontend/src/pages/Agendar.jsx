import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import { useAuth } from '../context/AuthContext';
import '../calendar.css';

function Agendar() {
  const { servicoId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;


  const [servico, setServico] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  const [selectedProfissional, setSelectedProfissional] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHorario, setSelectedHorario] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resServico, resProfissionais] = await Promise.all([
          axios.get(`${apiUrl}/api/servicos/${servicoId}`),
          axios.get(`${apiUrl}/api/profissionais`)
        ]);
        setServico(resServico.data);
        setProfissionais(resProfissionais.data);
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
      }
    };
    fetchData();
  }, [servicoId]);

  useEffect(() => {
    if (selectedProfissional && selectedDate) {
      const dataFormatada = selectedDate.toISOString().split('T')[0];
      axios.get(`${apiUrl}/api/profissionais/${selectedProfissional}/disponibilidade?data=${dataFormatada}&servicoId=${servicoId}`)
        .then(response => {
          setHorariosDisponiveis(response.data);
          setSelectedHorario('');
        })
        .catch(error => console.error("Erro ao buscar horários:", error));
    }
  }, [selectedProfissional, selectedDate, servicoId]);

  const handleConfirmarAgendamento = async () => {
    if (!token) {
      alert('Você precisa estar logado para confirmar o agendamento.');
      navigate('/', { state: { from: location } });
      return;
    }

    if (!selectedHorario) {
      alert('Por favor, selecione um horário.');
      return;
    }

    const [hora, minuto] = selectedHorario.split(':');
    const data_hora_inicio = new Date(selectedDate);
    data_hora_inicio.setHours(hora, minuto);

    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.post(`${apiUrl}/api/agendamentos`, {
        servicoId: parseInt(servicoId),
        profissionalId: parseInt(selectedProfissional),
        data_hora_inicio: data_hora_inicio.toISOString(),
      }, config);

      alert('Agendamento confirmado com sucesso!');
      navigate('/meus-agendamentos');
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      alert('Não foi possível confirmar o agendamento.');
    }
  };

  if (!servico) return <p>Carregando....</p>;

  return (
    <div className="container" style={{ padding: '20px' }}>
      <article>
        <h2>Agendamento para: {servico.nome}</h2>
        <p>Preço: <strong>R$ {servico.preco.toFixed(2)}</strong> - Duração: <strong>{servico.duracao_minutos} min</strong></p>
        <hr/>

        <h4>1. Escolha o Profissional</h4>
        <select onChange={(e) => setSelectedProfissional(e.target.value)} value={selectedProfissional}>
          <option value="">Selecione...</option>
          {profissionais.map(prof => (
            <option key={prof.id} value={prof.id}>{prof.usuario.nome}</option>
          ))}
        </select>

        {selectedProfissional && (
          <>
            <h4>2. Escolha a Data</h4>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} />
            </div>
          </>
        )}

        {selectedProfissional && selectedDate && (
          <>
            <h4>3. Escolha o Horário</h4>
            {horariosDisponiveis.length === 0 ? (
              <p>Nenhum horário disponível para a data e profissional selecionados.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {horariosDisponiveis.map(horario => (
                  <button 
                    key={horario} 
                    onClick={() => setSelectedHorario(horario)}
                    className={`horario-button ${selectedHorario === horario ? 'selected' : ''}`}
                  >
                    {horario}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {selectedHorario && (
          <div style={{ marginTop: '30px' }} className="card-servico">
            <h3>Confirmação</h3>
            <p><strong>Serviço:</strong> {servico.nome}</p>
            <p><strong>Profissional:</strong> {profissionais.find(p => p.id == selectedProfissional)?.usuario.nome}</p>
            <p><strong>Data:</strong> {selectedDate.toLocaleDateString('pt-BR')}</p>
            <p><strong>Horário:</strong> {selectedHorario}</p>
            <button onClick={handleConfirmarAgendamento}>
              Confirmar Agendamento
            </button>
          </div>
        )}
      </article>
    </div>
  );
}

export default Agendar;