// ====================================
// src/components/funeraria/RutaFuneraria.jsx - Protege el módulo de la funeraria
// ====================================
import React from 'react';
import { Navigate } from 'react-router-dom';
import { funerariaSesion } from '../../services/funerariaSesion';

const RutaFuneraria = ({ children }) => {
  if (!funerariaSesion.activa()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default RutaFuneraria;
