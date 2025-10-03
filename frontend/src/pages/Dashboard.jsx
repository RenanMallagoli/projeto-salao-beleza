import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Dashboard() {

 return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <article>
        <h1>Painel do Administrador</h1>
        <p>Selecione uma opção abaixo para gerenciar o salão.</p>

        <nav>
          <ul>
            <li><Link to="/admin/servicos">Gerenciar Serviços</Link></li>
            <li><Link to="/admin/profissionais">Gerenciar Profissionais</Link></li>
            {/* Futuramente, podemos adicionar um link para ver TODOS os agendamentos aqui */}
          </ul>
        </nav>
      </article>
    </div>
  );
}

export default Dashboard;