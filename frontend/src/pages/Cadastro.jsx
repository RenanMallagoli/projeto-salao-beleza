import React, { useState } from 'react';
import axios from 'axios';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem('');

    if (!nome || !email || !senha) {
      setMensagem('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        nome: nome,
        email: email,
        senha: senha,
      });

      setMensagem(`Usuário ${response.data.nome} cadastrado com sucesso!`);

      setNome('');
      setEmail('');
      setSenha('');

    } catch (error) {
      if (error.response && error.response.data) {
        setMensagem(error.response.data.error);
      } else {
        setMensagem('Ocorreu um erro ao tentar cadastrar.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Cadastro de Novo Usuário</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '4px' }}>
          Cadastrar
        </button>
      </form>
      {/* Exibe a mensagem de sucesso ou erro */}
      {mensagem && <p style={{ marginTop: '20px', color: 'green' }}>{mensagem}</p>}
    </div>
  );
}

export default Cadastro;