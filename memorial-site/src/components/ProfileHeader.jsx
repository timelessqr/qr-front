import React from 'react'

const ProfileHeader = () => {
  return (
    <div className="relative">
      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
          <img src="/img/abuelita.jpg" alt="Foto de perfil" className=" object-cover object-center" />
        </div>
      </div>
      <div className="pt-24 pb-6 px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">María Salud Ramírez Caballero</h1>
        <p className="text-gray-600 mt-2 italic font-light text-lg">"El amor y los recuerdos nos mantienen vivos más allá del tiempo."</p>
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
             <img src="/img/banderaChile.jpg" alt="Bandera de México" className="h-4 w-6 mr-2" />
            <p className="text-gray-700">Santiago de Chile</p>
          </div>
        </div>
        <button className="mt-5 inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-full shadow-md transition duration-300">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Compartir
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;