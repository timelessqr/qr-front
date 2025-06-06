import React from 'react'

const NavBar = () => {
  return (
    <nav className="bg-white text-black py-3 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <span className="text-2xl font-bold">LAZOS DE VIDA</span>
        </div>
        <button className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-md font-medium flex items-center transition duration-300 bt">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
          </svg>
          Perfil
        </button>
      </div>
    </nav>
  );
};

export default NavBar;