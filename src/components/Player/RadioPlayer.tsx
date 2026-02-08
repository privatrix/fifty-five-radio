
import React, { useState, useEffect } from 'react';
import { useRadio } from '@/context/RadioContext';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RadioPlayer() {
    const { currentSong, isPlaying, togglePlay, volume, setVolume, isLoading, isLive, goLive, getCurrentTime } = useRadio();
    const [progress, setProgress] = useState(0);

    // Update progress bar
    React.useEffect(() => {
        if (!currentSong) return;

        const interval = setInterval(() => {
            const time = getCurrentTime();
            const duration = currentSong.duration || 1;
            const pct = Math.min(100, Math.max(0, (time / duration) * 100));
            setProgress(pct);
        }, 200); // 5fps update is enough for smooth bar

        return () => clearInterval(interval);
    }, [currentSong, getCurrentTime]);

    if (!currentSong) return null;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 p-4 z-50 text-white"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

                {/* Song Info */}
                <div className="flex items-center gap-4 w-1/3">
                    <div className="relative w-12 h-12 rounded overflow-hidden group">
                        <img
                            src={currentSong.coverUrl}
                            alt={currentSong.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {isPlaying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: ['20%', '100%', '20%'] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                        className="w-1 bg-primary"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <h3 className="font-bold text-sm truncate">{currentSong.title}</h3>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-1 w-1/3">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-2 w-2 relative">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                        </span>
                        <div className="flex flex-col">
                            <span className={`text-[10px] uppercase tracking-widest font-bold ${isLive ? 'text-red-500' : 'text-yellow-400'}`}>
                                {isLive ? (isPlaying ? 'ÎN DIRECT' : 'OFFLINE') : 'AVANPREMIERĂ'}
                            </span>
                            {!isLive && (
                                <button onClick={goLive} className="text-[10px] font-bold text-red-500 hover:text-white transition-colors border border-red-500 px-2 py-0.5 rounded hover:bg-red-500 mt-1">
                                    REVIN-O LIVE
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying ? (
                                <Pause size={20} fill="currentColor" />
                            ) : (
                                <Play size={20} fill="currentColor" className="ml-0.5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Volume & Extras */}
                <div className="flex items-center justify-end gap-4 w-1/3">
                    <div className="flex items-center gap-2 group">
                        <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
                            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer hover:bg-white/20 accent-white"
                        />
                    </div>
                </div>

            </div>

            {/* Progress Bar (Visual Only for Live Radio) */}
            {currentSong && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </motion.div>
    );
}
