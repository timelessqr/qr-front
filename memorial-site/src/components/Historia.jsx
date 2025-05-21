import React from 'react'

const Historia = () => {
  return (
    <div className="animate-fadeIn">
      <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Biografía</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="aspect-square rounded-lg overflow-hidden shadow-md mb-4">
              <img src="/young-photo.jpg" alt="Foto de joven" className="w-full h-full object-cover" />
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-800 mb-2">Datos personales</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex">
                  <span className="font-medium w-24">Nacimiento:</span>
                  <span>15 mayo 1938</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-24">Fallecimiento:</span>
                  <span>23 octubre 2024</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-24">Profesión:</span>
                  <span>Artesana</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-24">Familia:</span>
                  <span>8 hijos, 25 nietos</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <div className="prose max-w-none text-gray-700">
              <p className="text-lg leading-relaxed">
                María Salud nació en un pequeño pueblo de Santa Fe de la Laguna, Michoacán, donde vivió toda su vida cultivando las tradiciones y el arte de su tierra natal.
              </p>
              
              <p className="mt-4">
                Conocida por todos como "Mamá Salud", fue una mujer extraordinaria cuya sonrisa iluminaba cada habitación. Se dedicó a la artesanía tradicional purépecha, creando hermosas piezas de barro que se exhiben en museos de todo México.
              </p>
              
              <p className="mt-4">
                Su vida transcurrió entre el trabajo honesto, el cuidado de su numerosa familia y la preservación de las tradiciones indígenas. Aprendió el arte de la alfarería de su madre a los 8 años y lo perfeccionó a lo largo de su vida, convirtiéndose en una maestra reconocida que compartió sus conocimientos con generaciones más jóvenes.
              </p>
              
              <p className="mt-4">
                En 2015, su rostro y espíritu inspiraron a los creadores de una famosa película de animación, inmortalizando su imagen y haciendo que su calidez y sabiduría fueran conocidas en todo el mundo.
              </p>
              
              <p className="mt-4">
                María Salud fue también guardiana de la medicina tradicional, conocedora de hierbas curativas y remedios ancestrales que utilizaba para ayudar a los enfermos de su comunidad. Su generosidad no conocía límites, siempre dispuesta a compartir lo poco o mucho que tenía con quien lo necesitara.
              </p>
              
              <p className="mt-4">
                Nos dejó un 23 de octubre de 2024, rodeada de sus seres queridos, pero su legado cultural y espiritual permanecerá vivo en cada pieza de artesanía, en cada historia contada sobre ella y en los corazones de quienes tuvieron el privilegio de conocerla.
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="text-red-600 hover:text-red-800 font-medium flex items-center">
                Leer biografía completa
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historia;