import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const icons = {
    close: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    play: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
};

const MusicPlayer = ({ songs, onClose, onSelectSong }) => (
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
                <h3 className="font-bold text-stone-700">Música del Recuerdo</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-200">
                    <icons.close className="w-5 h-5 text-stone-600"/>
                </button>
            </div>
            
            <ul className="flex-1 overflow-y-auto p-4 pt-2 space-y-2">
                {songs.map((song, index) => (
                    <li key={index} 
                        onClick={() => onSelectSong(song)}
                        className="flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors hover:bg-stone-200"
                    >
                        <span className="text-sm font-medium text-stone-700">{song.title}</span>
                        <div className="p-2 rounded-full bg-stone-200/50 hover:bg-amber-500 text-stone-600 hover:text-white transition-colors">
                            <icons.play className="w-4 h-4"/>
                        </div>
                    </li>
                ))}
            </ul>
        </motion.div>
    </motion.div>
);

export default MusicPlayer;