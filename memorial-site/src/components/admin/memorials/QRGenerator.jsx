// ====================================
// src/components/admin/memorials/QRGenerator.jsx - Generador e impresión de QR
// ====================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qrService, memorialService } from '../../../services';

const QRGenerator = () => {
  const { memorialId } = useParams();
  const navigate = useNavigate();
  
  const [memorial, setMemorial] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (memorialId) {
      loadMemorialAndQR();
    }
  }, [memorialId]);

  const loadMemorialAndQR = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar datos del memorial
      const memorialData = await memorialService.getMemorialById(memorialId);
      setMemorial(memorialData);
      
      // Si ya tiene QR, mostrarlo
      if (memorialData.qr) {
        setQrData(memorialData.qr);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    try {
      setGenerating(true);
      setError('');
      
      const newQR = await qrService.generateQR(memorialId);
      setQrData(newQR);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadQR = () => {
    if (qrData?.qrImageUrl) {
      const link = document.createElement('a');
      link.href = qrData.qrImageUrl;
      link.download = `QR_${memorial?.nombre || 'memorial'}_${qrData.code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const memorialURL = qrData ? `${window.location.origin}/memorial/${qrData.code}` : '';

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Estilos para impresión */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 no-print">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <button
                    onClick={() => navigate('/admin/memorials')}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    Memoriales
                  </button>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      Código QR
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <h1 className="text-2xl font-bold text-gray-900">
              Código QR - {memorial?.nombre}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Genera e imprime el código QR para acceder al memorial
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6 no-print">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel de control */}
            <div className="no-print">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Control del QR
                </h3>
                
                {!qrData ? (
                  <div className="text-center py-6">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-gray-500 mb-4">
                      Este memorial aún no tiene código QR generado
                    </p>
                    <button
                      onClick={generateQR}
                      disabled={generating}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m12 2v4m0 12v4m8-10h-4M6 12H2"></path>
                          </svg>
                          Generando...
                        </>
                      ) : (
                        <>
                          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          Generar QR
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código QR
                      </label>
                      <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                        {qrData.code}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL del Memorial
                      </label>
                      <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded break-all">
                        {memorialURL}
                      </p>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                      <button
                        onClick={handlePrint}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-1a2 2 0 00-2-2H9a2 2 0 00-2 2v1a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir QR
                      </button>
                      
                      <button
                        onClick={downloadQR}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Descargar Imagen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Área de impresión */}
            <div className="print-area">
              {qrData && (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  {/* Logo/Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Lazos de Vida
                    </h2>
                    <p className="text-gray-600">Memorial Digital</p>
                  </div>

                  {/* QR Code */}
                  <div className="mb-6">
                    {qrData.qrImageUrl ? (
                      <img
                        src={qrData.qrImageUrl}
                        alt="Código QR"
                        className="mx-auto w-48 h-48 border-2 border-gray-200 rounded"
                      />
                    ) : (
                      <div className="mx-auto w-48 h-48 border-2 border-gray-200 rounded flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500">QR Code</p>
                      </div>
                    )}
                  </div>

                  {/* Información */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {memorial?.nombre}
                    </h3>
                    <p className="text-gray-600">
                      Código: {qrData.code}
                    </p>
                    <p className="text-sm text-gray-500 break-all">
                      {memorialURL}
                    </p>
                  </div>

                  {/* Instrucciones */}
                  <div className="mt-8 text-sm text-gray-600">
                    <p className="font-medium mb-2">Instrucciones:</p>
                    <p>Escanee este código QR con la cámara de su teléfono</p>
                    <p>para acceder al memorial digital</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRGenerator;
