import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdminEditarServico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;


  const [servico, setServico] = useState({
    nome: '',
    descricao: '',
    duracao_minutos: '',
    preco: '',
  });
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const fetchServico = async () => {
      try {
      const response = await axios.get(`${apiUrl}/api/servicos/${id}`);
        setServico({
            nome: response.data.nome,
            descricao: response.data.descricao || '',
            duracao_minutos: response.data.duracao_minutos.toString(),
            preco: response.data.preco.toString(),
        });
      } catch (error) {
        console.error('Erro ao buscar serviço:', error);
        setMensagem('Serviço não encontrado.');
      }
    };
    fetchServico();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServico({ ...servico, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      const dadosParaEnviar = {
        ...servico,
        duracao_minutos: parseInt(servico.duracao_minutos),
        preco: parseFloat(servico.preco)
      };

      await axios.put(`${apiUrl}/api/servicos/${id}`, dadosParaEnviar, config);

      setMensagem('Serviço atualizado com sucesso!');
      setTimeout(() => navigate('/admin/servicos'), 1500);

    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      setMensagem(error.response?.data?.error || 'Erro ao atualizar serviço.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/servicos'); 
  };

  return (
    <div className="container">
      <article style={{ position: 'relative' }}> 

        <button className="close-button" onClick={handleCancel}>&times;</button>

        <h2>Editar Serviço</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="nome">Nome do Serviço</label>
          <input type="text" id="nome" name="nome" value={servico.nome} onChange={handleInputChange} required />

          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" value={servico.descricao} onChange={handleInputChange}></textarea>

          <label htmlFor="duracao_minutos">Duração (minutos)</label>
          <input type="number" id="duracao_minutos" name="duracao_minutos" value={servico.duracao_minutos} onChange={handleInputChange} required />

          <label htmlFor="preco">Preço (ex: 90.50)</label>
          <input type="number" id="preco" name="preco" value={servico.preco} onChange={handleInputChange} step="0.01" required />

          <div className="grid">
            <button type="button" className="secondary" onClick={handleCancel}>Cancelar</button>
            <button type="submit">Salvar Alterações</button>
          </div>

        </form>
        {mensagem && <p>{mensagem}</p>}
      </article>
    </div>
  );
}

export default AdminEditarServico;