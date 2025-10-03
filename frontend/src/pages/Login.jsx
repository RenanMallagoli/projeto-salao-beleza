import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

const { login } = useAuth();
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem('');

    if (!email || !senha) {
      setMensagem('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: email,
        senha: senha,
      });

      login(response.data.token);
      navigate(from, { replace: true});

    } catch (error) {
      if (error.response && error.response.data) {
        setMensagem(error.response.data.error);
      } else {
        setMensagem('Ocorreu um erro ao tentar fazer o login.');
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <article style={{ maxWidth: '480px', margin: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="senha">Senha:</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>
        {mensagem && <p style={{ color: 'var(--pico-color-red-500)', textAlign: 'center' }}>{mensagem}</p>}
      </article>
    </div>
  );
}

export default Login;