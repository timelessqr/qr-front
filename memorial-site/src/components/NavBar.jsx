import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import logoImage from "/img/logos/derecho.png";

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Links de redes sociales (usando los mismos del footer para consistencia, puedes ajustarlos si son diferentes para la navbar)

  // Definimos la animación del logo para el efecto hover con mayor escala (escritorio)
  const logoHoverAnimation = {
    rest: { scale: 1.0 },
    hover: { scale: 1.18, transition: { duration: 0.3, ease: "easeOut" } },
  };

  // Animación específica para el logo móvil
  // Ajustada la escala del 'tap' para que sea igual a la del hover de escritorio
  const mobileLogoAnimation = {
    rest: { scale: 1.0 },
    hover: { scale: 1.12, transition: { duration: 0.3, ease: "easeOut" } }, // Animación al pasar el mouse (si aplica en algunos dispositivos)
    tap: { scale: 1.18, transition: { duration: 0.1, ease: "easeOut" } }, // Ajustada la escala al tocar (para móviles)
  };

  // Efecto para manejar el scroll y cambiar el estilo de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    // Limpieza del event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // El array vacío asegura que el efecto solo se ejecute una vez al montar el componente

  // Estilo base para la navbar
  const baseStyle = {
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  };

  return (
    // <nav className="bg-white text-black py-0 px-4 shadow-md">
    //   <div className="container mx-auto flex justify-between items-center">
    //     <div className="w-[130px] h-[130px]">
    //       <img
    //         src="/img/logos/favicon.svg"
    //         alt="Icono derecho"
    //         className="w-[130px] h-[130px] object-contain transition-all duration-300"
    //       />
    //     </div>

    //     <button className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-md font-medium flex items-center transition duration-300 bt">
    //       <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
    //         <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
    //       </svg>
    //       Perfil
    //     </button>
    //   </div>
    // </nav>
    <div className="fixed left-0 right-0 z-50 ">
      {/* Contenedor principal de la navbar, cambia el fondo al hacer scroll */}
      <div className={scrolled ? "bg-white  shadow-md md:mr-[67px] md:ml-[67px]" : "md:mr-[67px] md:ml-[67px]"}>
        <nav
          style={scrolled ? { backdropFilter: "blur(8px)" } : baseStyle}
          className=" transition-all duration-300"
        >
          <div className="container mx-auto px-4 py-12 md:py-16 flex justify-between items-center relative">
            {/* Versión móvil */}
            <div className="flex w-full items-center justify-between md:hidden ">
              {/* Logo Centrado para móvil */}
              <div className="absolute left-1/2 transform -translate-x-1/2 ">
                <motion.a
                  href="#" // Reemplaza con el link a la página de inicio si es necesario
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap" // Añadida animación al tocar
                  animate="rest"
                >
                  <motion.div
                    variants={mobileLogoAnimation} // Usamos las variantes actualizadas
                    style={{
                      width: "160px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      backgroundColor: "transparent",
                    }}
                  >
                    <img
                      src={logoImage}
                      alt="Lazos de Vida"
                      className="w-full h-full object-contain transition-all duration-300"
                      style={{ transform: "scale(2.5)" }} // Escala del logo
                    />
                  </motion.div>
                </motion.a>
              </div>
            </div>

            {/* Versión Desktop */}

            {/* Logo Centrado para Desktop */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
              <motion.a
                href="#" // Reemplaza con el link a la página de inicio si es necesario
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <motion.div
                  variants={logoHoverAnimation}
                  style={{
                    width: "400px", // Ancho del contenedor del logo
                    height: "90px", // Alto del contenedor del logo
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    backgroundColor: "transparent",
                  }}
                >
                  <img
                    src={logoImage}
                    alt="Lazos de Vida"
                    className="w-full h-full object-contain transition-all duration-300"
                    style={{ transform: "scale(3.0)" }} // Escala del logo
                  />
                </motion.div>
              </motion.a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default NavBar;
