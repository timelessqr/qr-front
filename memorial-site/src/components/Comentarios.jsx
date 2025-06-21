import React, { useState } from 'react';

const Comentarios = () => {
  // Estado para los comentarios
  const [comentarios, setComentarios] = useState([
    // {
    //   id: 1,
    //   nombre: "Lucía Hernández",
    //   tiempo: "Hace 1 día",
    //   mensaje: "Abuelita, gracias por todas tus enseñanzas y por el amor que siempre nos diste. Te recordaré cada día en mis oraciones.",
    //   likes: 10
    // },
    // {
    //   id: 2,
    //   nombre: "Miguel Ramírez",
    //   tiempo: "Hace 2 días",
    //   mensaje: "Mamá Salud, tu fortaleza y amor siguen guiándonos cada día. Descansa en paz, siempre vivirás en nuestros corazones.",
    //   likes: 11
    // },
    // {
    //   id: 3,
    //   nombre: "Carmen Jiménez",
    //   tiempo: "Hace 3 días",
    //   mensaje: "Una mujer extraordinaria que inspiró a toda una comunidad. Su sonrisa y sabiduría nos acompañarán siempre.",
    //   likes: 12
    // }
  ]);

  // Estado para el nuevo comentario
  const [nuevoComentario, setNuevoComentario] = useState({
    nombre: "",
    mensaje: ""
  });

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoComentario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Agregar nuevo comentario
  const agregarComentario = (e) => {
    e.preventDefault();
    if (!nuevoComentario.mensaje.trim()) return;

    const comentario = {
      id: Date.now(), // Usamos el timestamp como ID único
      nombre: nuevoComentario.nombre || "Anónimo",
      tiempo: "Hace unos momentos",
      mensaje: nuevoComentario.mensaje,
      likes: 0
    };

    setComentarios([comentario, ...comentarios]);
    setNuevoComentario({ nombre: "", mensaje: "" });
  };

  // Dar like a un comentario
  const darLike = (id) => {
    setComentarios(comentarios.map(comentario => 
      comentario.id === id ? {...comentario, likes: comentario.likes + 1} : comentario
    ));
  };

  // Eliminar un comentario
  const eliminarComentario = (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este comentario?")) {
      setComentarios(comentarios.filter(comentario => comentario.id !== id));
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center pt-4">Mensajes de condolencia</h2>
        
        {/* Formulario para escribir comentario */}
        <div className="px-6 pb-6 border-b border-gray-200">
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <h3 className="text-gray-800 font-medium mb-3">Comparte tu mensaje</h3>
            <form onSubmit={agregarComentario}>
              <input
                type="text"
                name="nombre"
                value={nuevoComentario.nombre}
                onChange={handleChange}
                className="w-full mb-3 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Tu nombre (opcional)"
              />
              <textarea
                name="mensaje"
                value={nuevoComentario.mensaje}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows="3"
                placeholder="Escribe un mensaje en memoria de María Salud..."
                required
              ></textarea>
              <div className="mt-4 flex justify-end">
                <button 
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-md transition duration-300 shadow-sm"
                >
                  Publicar mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Lista de comentarios en tarjetas horizontales */}
        <div className="px-6 py-6">
          <div className="space-y-6">
            {/* Filtros horizontales */}
            <div className="flex flex-wrap gap-2 mb-6">
              {/* <button className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                Todos
              </button> */}
              {/* <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition duration-200">
                Familia
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition duration-200">
                Amigos
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition duration-200">
                Comunidad
              </button> */}
            </div>
            
            {/* Comentarios */}
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-orange-200 transition-colors duration-200">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {/* <img 
                        src={`/avatar-${(comentario.id % 5) + 1}.jpg`} 
                        alt="Usuario" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/avatar-default.jpg";
                        }}
                      /> */}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{comentario.nombre}</h3>
                      <span className="text-gray-500 text-sm">{comentario.tiempo}</span>
                    </div>
                    <p className="mt-2 text-gray-700">{comentario.mensaje}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <button 
                          className="flex items-center hover:text-red-600 transition-colors duration-200 mr-4"
                          onClick={() => darLike(comentario.id)}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {comentario.likes} Me gusta
                        </button>
                        <button className="flex items-center hover:text-red-600 transition-colors duration-200">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                          </svg>
                          Responder
                        </button>
                      </div>
                      <button 
                        onClick={() => eliminarComentario(comentario.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        title="Eliminar comentario"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Ver más comentarios (opcional) */}
            {comentarios.length > 5 && (
              <div className="text-center">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-md transition duration-300 inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Ver más comentarios
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comentarios;