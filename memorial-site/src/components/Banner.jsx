import React from 'react'

const Banner = () => {
  return (
    <div className="w-full h-64 bg-gradient-to-b from-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'url(/placeholder-altar.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-9 gap-1 max-w-5xl w-full px-4">
          {/* Velas y fotos pequeñas simulando un altar */}
         
        </div>
      </div>
    </div>
  );
};

export default Banner;