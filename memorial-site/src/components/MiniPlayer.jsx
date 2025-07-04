import React from 'react';
import { motion } from 'framer-motion';

const icons = {
    music: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
    play: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    pause: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>,
    stop: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>,
};

const MiniPlayer = ({ song, onStop, onTogglePlay, isPlaying }) => {
    return (
        <motion.div
            className="fixed bottom-2 sm:bottom-4 left-2 right-2 sm:left-auto sm:right-4 z-40 bg-white/90 backdrop-blur-md rounded-lg shadow-lg flex items-center gap-2 sm:gap-4 p-2 sm:p-3 max-w-sm sm:max-w-none mx-auto sm:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
        >
            {/* Icono de música */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center flex-shrink-0 bg-green-100">
                <icons.music className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>

            {/* Información de la canción */}
            <div className="flex-1 min-w-0">
                <p className="font-memorial text-xs sm:text-sm font-medium text-stone-700 truncate">
                    {song.title || song.titulo || song.archivo?.nombreOriginal || 'Canción sin título'}
                </p>
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-memorial text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        MP3
                    </span>
                    <span className="font-memorial text-xs text-stone-500">
                        {isPlaying ? 'Reproduciendo' : 'Pausado'}
                    </span>
                </div>
            </div>

            {/* Controles para MP3 */}
            <div className="flex items-center space-x-1">
                <button 
                    onClick={onTogglePlay} 
                    className="p-1.5 sm:p-2 rounded-full hover:bg-stone-200 touch-manipulation"
                    title={isPlaying ? "Pausar" : "Reproducir"}
                >
                    {isPlaying ? (
                        <icons.pause className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" />
                    ) : (
                        <icons.play className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" />
                    )}
                </button>
                <button onClick={onStop} className="p-1.5 sm:p-2 rounded-full hover:bg-stone-200 touch-manipulation" title="Detener">
                    <icons.stop className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" />
                </button>
            </div>
        </motion.div>
    );
};

export default MiniPlayer;
