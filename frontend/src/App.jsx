import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 

function App() {
  const { token, user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

// frontend/src/App.jsx

return (
  <>
    <header className="site-header">
      <div className="container">
        <h1 className="site-title">Salão de Beleza Charme & Estilo</h1>
        <nav>
          {(!user || user.tipo === 'CLIENTE') && (
            <Link to="/servicos">Serviços</Link>
          )}

          {token ? (
            <>
              {(user?.tipo === 'CLIENTE' || user?.tipo === 'PROFISSIONAL') && (
                <Link to="/meus-agendamentos">Meus Agendamentos</Link>
              )}              
              {user?.tipo === 'ADMIN' && (
                <Link to="/dashboard">Painel do Admin</Link>
              )}
              
              <button onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/" style={{ marginLeft: 'auto' }}>Login</Link>
              <Link to="/cadastro">Cadastro</Link>
            </>
          )}
        </nav>
      </div>
    </header>
    <main className="container">
      <Outlet />
    </main>
  </>
);
}


export default App;