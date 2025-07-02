// ====================================
// src/hooks/useMemorial.js - Hook para gestión de memoriales (CORREGIDO)
// ====================================
import { useState, useEffect, useCallback } from 'react';
import { memorialService } from '../services';

export const useMemorial = (memorialId = null) => {
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔧 MEMOIZAR: Cargar memorial específico
  const loadMemorial = useCallback(async (id = memorialId) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await memorialService.getMemorialById(id);
      setMemorial(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [memorialId]);

  // 🔧 MEMOIZAR: Cargar memorial público por QR
  const loadPublicMemorial = useCallback(async (qrCode) => {
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
  }, []);

  // 🔧 MEMOIZAR: Crear nuevo memorial
  const createMemorial = useCallback(async (memorialData) => {
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
  }, []);

  // 🔧 MEMOIZAR: Actualizar memorial
  const updateMemorial = useCallback(async (id, memorialData) => {
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
  }, []);

  // 🔧 MEMOIZAR: Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ Efecto para cargar memorial al montar el componente
  useEffect(() => {
    if (memorialId) {
      loadMemorial(memorialId);
    }
  }, [memorialId]); // ✅ Solo memorialId, no loadMemorial

  return {
    memorial,
    loading,
    error,
    loadMemorial,
    loadPublicMemorial,
    createMemorial,
    updateMemorial,
    setMemorial,
    setError: clearError
  };
};

export default useMemorial;