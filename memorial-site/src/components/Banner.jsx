import React from 'react'

const Banner = () => {
  return (
    <div className="w-full h-64 bg-gradient-to-b from-purple-800 via-red-600 to-orange-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'url(/placeholder-altar.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-9 gap-1 max-w-5xl w-full px-4">
          {/* Velas y fotos pequeñas simulando un altar */}
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-6 h-14 md:w-10 md:h-20 bg-yellow-100 rounded-t-md opacity-70"></div>
              {i % 2 === 0 && (
                <div className="w-10 h-10 md:w-16 md:h-16 bg-yellow-50 border-2 border-yellow-200 rounded-md mt-2 overflow-hidden shadow-md">
                  <img src={`/placeholder-${100 + i}.jpg`} alt="Foto en altar" className="w-full h-full object-cover" />
                </div>
              )}
              {i % 3 === 0 && (
                <div className="w-8 h-8 bg-orange-100 rounded-full mt-2 shadow-md flex items-center justify-center">
                  <div className="w-6 h-6 bg-orange-300 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;