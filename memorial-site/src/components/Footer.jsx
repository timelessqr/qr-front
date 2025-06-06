import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-black py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-2xl font-bold">LAZOS DE VIDA</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-gray-400 hover:text-black transition duration-300">Términos</a>
            <a href="#" className="text-gray-400 hover:text-black transition duration-300">Privacidad</a>
            <a href="#" className="text-gray-400 hover:text-black transition duration-300">Contacto</a>
          </div>
        </div>
        <div className="mt-6 text-center text-gray-400 text-sm">
          © 2025 Luto Eterno. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;