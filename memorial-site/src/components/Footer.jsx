import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-black py-2 mt-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0">
            <img
            src="/img/logos/derecho.png"
            alt="Icono derecho"
            className="h-40 md:h-80 object-contain font-lora"
          />
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-gray-400 hover:text-black transition duration-300">Términos</a>
            <a href="#" className="text-gray-400 hover:text-black transition duration-300">Privacidad</a>
            <a href="#" className="text-gray-400 hover:text-black transition duration-300">Contacto</a>
          </div>
        </div>
        {/* Copyright - Centrado en móvil, justificado en escritorio */}
        <div className="text-center md:text-left mb-2 md:mb-0">
          <p className="text-xs md:text-sm text-gray-800">
            &copy; {new Date().getFullYear()} Lazos de Vida. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Diseñado por <a href="https://bitsdeve.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">bitsdeve 🤖</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;