import React from 'react';
import { motion } from 'framer-motion';

const icons = {
    music: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
    play: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
    pause: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>,
    stop: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>,
    close: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
};

const MiniPlayer = ({ song, onStop, onTogglePlay, isPlaying }) => (
    <motion.div
        className="fixed bottom-4 right-4 z-40 bg-white/90 backdrop-blur-md rounded-lg shadow-lg flex items-center gap-4 p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
    >
        <icons.music className="w-6 h-6 text-stone-600" />
        <div className="flex-1">
            <p className="text-sm font-medium text-stone-700">Reproduciendo:</p>
            <p className="text-xs text-stone-500 truncate w-32">{song.title}</p>
        </div>
        <button onClick={onTogglePlay} className="p-2 rounded-full hover:bg-stone-200">
            {isPlaying ? (
                <icons.pause className="w-5 h-5 text-stone-600" />
            ) : (
                <icons.play className="w-5 h-5 text-stone-600" />
            )}
        </button>
        <button onClick={onStop} className="p-2 rounded-full hover:bg-stone-200">
            <icons.stop className="w-5 h-5 text-stone-600" />
        </button>
    </motion.div>
);

export default MiniPlayer;