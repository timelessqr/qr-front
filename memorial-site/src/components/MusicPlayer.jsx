import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const icons = {
    close: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    play: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    music: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
};

const MusicPlayer = ({ songs, onClose, onSelectSong, loading = false }) => {
    
    const formatDuration = (seconds) => {
        if (!seconds) return null;
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return null;
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <motion.div 
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <motion.div
                className="relative w-full max-w-sm h-full bg-stone-100/95 backdrop-blur-lg shadow-2xl flex flex-col"
                initial={{ x: '100%' }}
                animate={{ x: '0%' }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <div className="p-4 flex items-center justify-between border-b border-stone-200">
                    <h3 className="font-memorial font-bold text-stone-700">Su Música</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-200">
                        <icons.close className="w-5 h-5 text-stone-600"/>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 pt-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            <span className="font-memorial ml-3 text-stone-600">Cargando música...</span>
                        </div>
                    ) : songs.length > 0 ? (
                        <ul className="space-y-2">
                            {songs.map((song, index) => {
                                const duration = formatDuration(song.duracion || song.dimensiones?.duracion);
                                const fileSize = formatFileSize(song.tamaño || song.archivo?.tamaño);
                                
                                return (
                                    <li key={song.id || index} 
                                        onClick={() => onSelectSong(song)}
                                        className="flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors hover:bg-stone-200 group"
                                    >
                                        <div className="flex items-center flex-1 min-w-0">
                                            {/* Icono de música */}
                                            <div className="w-10 h-10 rounded mr-3 flex-shrink-0 flex items-center justify-center bg-green-100">
                                                <icons.music className="w-5 h-5 text-green-600" />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                            <p className="font-memorial text-sm font-medium text-stone-700 truncate">
                                            {song.title || song.titulo || song.archivo?.nombreOriginal || 'Canción sin título'}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                            <span className="font-memorial text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            MP3
                                            </span>
                                            {duration && (
                                            <span className="font-memorial text-xs text-stone-500">{duration}</span>
                                            )}
                                            {fileSize && (
                                            <span className="font-memorial text-xs text-stone-500">{fileSize}</span>
                                            )}
                                            </div>
                                            {song.description || song.descripcion ? (
                                            <p className="font-memorial text-xs text-stone-500 truncate mt-1">
                                            {song.description || song.descripcion}
                                            </p>
                                            ) : null}
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-full bg-stone-200/50 group-hover:bg-green-500 text-stone-600 group-hover:text-white transition-colors flex-shrink-0">
                                            <icons.play className="w-4 h-4"/>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mb-3">
                                <icons.music className="w-6 h-6 text-stone-400" />
                            </div>
                            <p className="font-memorial text-stone-600 font-medium">Sin música disponible</p>
                            <p className="font-memorial text-stone-500 text-sm">Aún no se han agregado canciones</p>
                        </div>
                    )}
                    
                    {/* Información sobre archivos MP3 */}
                    {songs.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start">
                                <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-xs text-green-700">
                                    <p className="font-memorial font-medium mb-1">Archivos de Audio MP3</p>
                                    <p className="font-memorial">Los archivos se reproducen con controles completos de reproducción.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MusicPlayer;
