// ====================================
// src/hooks/useMemorial.js - Hook para gestión de memoriales
// ====================================
import { useState, useEffect } from 'react';
import { memorialService } from '../services';

export const useMemorial = (memorialId = null) => {
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar memorial específico
  const loadMemorial = async (id = memorialId) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await memorialService.getMemorialById(id);
      setMemorial(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar memorial público por QR
  const loadPublicMemorial = async (qrCode) => {
    try {
      setLoading(true);
      setError(null);
      const data = await memorialService.getPublicMemorial(qrCode);
      setMemorial(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo memorial
  const createMemorial = async (memorialData) => {
    try {
      setLoading(true);
      setError(null);
      const newMemorial = await memorialService.createMemorial(memorialData);
      setMemorial(newMemorial);
      return newMemorial;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar memorial
  const updateMemorial = async (id, memorialData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMemorial = await memorialService.updateMemorial(id, memorialData);
      setMemorial(updatedMemorial);
      return updatedMemorial;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar memorial al montar el componente
  useEffect(() => {
    if (memorialId) {
      loadMemorial(memorialId);
    }
  }, [memorialId]);

  return {
    memorial,
    loading,
    error,
    loadMemorial,
    loadPublicMemorial,
    createMemorial,
    updateMemorial,
    setMemorial,
    setError
  };
};

export default useMemorial;
