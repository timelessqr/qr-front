// ====================================
// src/components/funeraria/FunerariaLayout.jsx - Módulo aislado de una funeraria
// ====================================
// Lo que ve una cuenta de funeraria: sus salas, el editor y el libro. Sin el
// menú del admin (memoriales, clientes, QR de Lazos).
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { funerariaSesion } from '../../services/funerariaSesion';
import { pergaminoAdmin, urlArchivo } from '../../services/pergaminoService';

const FunerariaLayout = () => {
  const navigate = useNavigate();
  const [sesion, setSesion] = useState(funerariaSesion.datos());

  // Revalida la sesión al entrar: si la cuenta fue desactivada o cambió la
  // contraseña, el backend responde 401 y el cliente vuelve al login
  useEffect(() => {
    pergaminoAdmin.yo()
      .then((r) => {
        funerariaSesion.guardar(null, { cuenta: r.cuenta, funeraria: r.funeraria });
        setSesion({ cuenta: r.cuenta, funeraria: r.funeraria });
      })
      .catch(() => {});
  }, []);

  const salir = () => {
    funerariaSesion.cerrar();
    navigate('/admin/login', { replace: true });
  };

  const enlace = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {sesion?.funeraria?.logoUrl ? (
              <img src={urlArchivo(sesion.funeraria.logoUrl)} alt="" className="h-9 w-9 object-contain" />
            ) : (
              <div className="h-9 w-9 rounded bg-gray-100" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{sesion?.funeraria?.nombre || 'Funeraria'}</p>
              <p className="text-xs text-gray-500">Pergaminos · Lazos de Vida</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/funeraria" end className={enlace}>Salas</NavLink>
            <NavLink to="/funeraria/cuenta" className={enlace}>Mi cuenta</NavLink>
            <button onClick={salir} className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700">Salir</button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default FunerariaLayout;
