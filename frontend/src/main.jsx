import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

import App from './App.jsx';
import Cadastro from './pages/Cadastro.jsx'; 
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminServicos from './pages/AdminServicos.jsx';
import AdminProfissionais from './pages/AdminProfissionais.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Servicos from './pages/Servicos.jsx';
import Agendar from './pages/Agendar.jsx';
import MeusAgendamentos from './pages/MeusAgendamentos.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminEditarServico from './pages/AdminEditarServico.jsx';

const router = createBrowserRouter([
  {
    path: '/',            
    element: <App />,     
    children: [
      {
        path: '/',      
        element: <Login />,
      },
      {
        path: '/cadastro', 
        element: <Cadastro />,
      },
      {
        path: '/servicos',
        element: <Servicos />,
      },
      {
        path: '/agendar/:servicoId',
        element: <Agendar />,
      },
      {
  element: <ProtectedRoute />,
  children: [
    {
      path: '/meus-agendamentos',
      element: <MeusAgendamentos />,
    },
  ],
},
{
  element: <AdminRoute />,
  children: [
    {
      path: '/dashboard',
      element: <Dashboard />,
    },
    {
      path: '/admin/servicos',
      element: <AdminServicos />,
    },
    {
      path: '/admin/profissionais',
      element: <AdminProfissionais />,
    },
    {
      path: '/admin/servicos/editar/:id',
      element: <AdminEditarServico />,
    },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
          <RouterProvider router={router} /> {/* Renderiza o provedor do roteador */}
    </AuthProvider>
  </React.StrictMode>
);