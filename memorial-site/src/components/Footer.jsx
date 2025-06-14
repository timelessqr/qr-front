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
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
              <p className="text-xs md:text-sm text-gray-800 mb-2 md:mb-0 text-center md:text-left">
                &copy; {new Date().getFullYear()} Lazos de Vida. Todos los derechos reservados.
              </p>
             
            </div>
      </div>
    </footer>
  );
};

export default Footer;