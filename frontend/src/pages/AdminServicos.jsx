import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function AdminServicos() {
  const [servicos, setServicos] = useState([]);
  const [novoServico, setNovoServico] = useState({
    nome: '',
    descricao: '',
    duracao_minutos: '',
    preco: '',
  });
  const [mensagem, setMensagem] = useState('');
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchServicos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/servicos`);
      setServicos(response.data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setMensagem('Erro ao buscar serviços.');
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoServico({ ...novoServico, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const dadosParaEnviar = {
        ...novoServico,
        duracao_minutos: parseInt(novoServico.duracao_minutos),
        preco: parseFloat(novoServico.preco)
      }

      await axios.post(`${apiUrl}/api/servicos`, dadosParaEnviar, config);

      setMensagem('Serviço criado com sucesso!');
      fetchServicos(); // Atualiza a lista de serviços
      setNovoServico({ nome: '', descricao: '', duracao_minutos: '', preco: '' });
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      setMensagem(error.response?.data?.error || 'Erro ao criar serviço.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este serviço?')) return;

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
    await axios.delete(`${apiUrl}/api/servicos/${id}`, config);
      setMensagem('Serviço deletado com sucesso!');
      fetchServicos();
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      setMensagem(error.response?.data?.error || 'Erro ao deletar serviço.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Gerenciar Serviços</h2>
      {mensagem && <p>{mensagem}</p>}

      {/* Formulário para Adicionar Novo Serviço */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <h3>Adicionar Novo Serviço</h3>
        <input type="text" name="nome" value={novoServico.nome} onChange={handleInputChange} placeholder="Nome do Serviço" required />
        <input type="text" name="descricao" value={novoServico.descricao} onChange={handleInputChange} placeholder="Descrição" />
        <input type="number" name="duracao_minutos" value={novoServico.duracao_minutos} onChange={handleInputChange} placeholder="Duração (minutos)" required />
        <input type="number" name="preco" value={novoServico.preco} onChange={handleInputChange} placeholder="Preço (ex: 90.50)" step="0.01" required />
        <button type="submit">Adicionar Serviço</button>
      </form>

      {/* Lista de Serviços Existentes */}
      <h3>Serviços Cadastrados</h3>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Duração (min)</th>
            <th>Preço (R$)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {servicos.map(servico => (
            <tr key={servico.id}>
              <td>{servico.nome}</td>
              <td>{servico.duracao_minutos}</td>
              <td>{servico.preco.toFixed(2)}</td>
              <td>
                <Link to={`/admin/servicos/editar/${servico.id}`} style={{ marginRight: '10px' }}>
                  <button>Editar</button>
                </Link>
                <button onClick={() => handleDelete(servico.id)} style={{backgroundColor: 'red', color: 'white'}}>Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminServicos;