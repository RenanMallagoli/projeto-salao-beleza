import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute(){
    const {token} = useAuth();

    if(!token){
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;