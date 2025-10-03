import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute() {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (user?.tipo !== 'ADMIN') {
    return <Navigate to="/meus-agendamentos" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;