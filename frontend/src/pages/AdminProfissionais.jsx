import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdminProfissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [mensagem, setMensagem] = useState('');
  const { token } = useAuth();

  const config = {
    headers: { 'Authorization': `Bearer ${token}` }
  };

  const fetchData = async () => {
    try {
      const [resProfissionais, resUsuarios] = await Promise.all([
        axios.get('http://localhost:3001/api/profissionais'),
        axios.get('http://localhost:3001/api/usuarios', config)
      ]);
      setProfissionais(resProfissionais.data);
      setUsuarios(resUsuarios.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setMensagem('Erro ao carregar dados da página.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setMensagem('Por favor, selecione um usuário.');
      return;
    }
    try {
      await axios.post('http://localhost:3001/api/profissionais', { usuarioId: parseInt(selectedUserId) }, config);
      setMensagem('Profissional adicionado com sucesso!');
      fetchData();
      setSelectedUserId('');
    } catch (error) {
      setMensagem(error.response?.data?.error || 'Erro ao adicionar profissional.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza? Isso irá remover o perfil profissional, mas não o usuário.')) return;
    try {
        await axios.delete(`http://localhost:3001/api/profissionais/${id}`, config);
        setMensagem('Profissional removido com sucesso!');
        fetchData();
    } catch (error) {
        setMensagem(error.response?.data?.error || 'Erro ao remover profissional.');
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Gerenciar Profissionais</h2>
      {mensagem && <p>{mensagem}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <h3>Adicionar Novo Profissional</h3>
        <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
          <option value="">Selecione um usuário para promover</option>
          {usuarios.map(user => (
            <option key={user.id} value={user.id}>
              {user.nome} ({user.email}) - {user.tipo}
            </option>
          ))}
        </select>
        <button type="submit">Adicionar Profissional</button>
      </form>

      <h3>Profissionais Atuais</h3>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {profissionais.map(prof => (
            <tr key={prof.id}>
              <td>{prof.usuario.nome}</td>
              <td>{prof.usuario.email}</td>
              <td>
                <button onClick={() => handleDelete(prof.id)} style={{backgroundColor: 'red', color: 'white'}}>Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProfissionais;