import React from 'react';

const TabsNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-t border-b border-gray-200 bg-gray-50">
      <div className="container mx-auto">
        <nav className="flex justify-center">
          <button 
            onClick={() => setActiveTab('historia')}
            className={`px-8 py-5 font-medium text-sm transition-colors duration-200 flex flex-col items-center focus:outline-none ${
              activeTab === 'historia' 
                ? 'border-b-2 border-red-500 text-red-600' 
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Mi Historia
          </button>
          <button 
            onClick={() => setActiveTab('contenido')}
            className={`px-8 py-5 font-medium text-sm transition-colors duration-200 flex flex-col items-center focus:outline-none ${
              activeTab === 'contenido' 
                ? 'border-b-2 border-red-500 text-red-600' 
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Contenido
          </button>
          <button 
            onClick={() => setActiveTab('comentarios')}
            className={`px-8 py-5 font-medium text-sm transition-colors duration-200 flex flex-col items-center focus:outline-none ${
              activeTab === 'comentarios' 
                ? 'border-b-2 border-red-500 text-red-600' 
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            Comentarios
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TabsNavigation;