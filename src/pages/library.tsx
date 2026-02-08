
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRadio } from '@/context/RadioContext'; // Use context instead of static data
import { Play, Pause, Download, ArrowLeft, Search } from 'lucide-react';

export default function Library() {
    const { songs, isPlaying, togglePlay, playTrack } = useRadio(); // Get songs from context
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Head>
                <title>Bibliotecă - 55.md</title>
            </Head>

            <div className="min-h-screen pt-20 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
                    <ArrowLeft size={20} />
                    Înapoi la Radio Live
                </Link>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">Bibliotecă Muzicală</h1>
                        <p className="text-gray-400">Navighează și descarcă piese generate de AI.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Caută piese..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-4 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSongs.map((song, index) => (
                        <motion.div
                            key={song.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors group"
                        >
                            <div className="aspect-square relative overflow-hidden">
                                <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => playTrack(song)}
                                        className="p-3 bg-primary text-white rounded-full hover:scale-110 transition-transform"
                                        title="Ascultă Acum"
                                    >
                                        <Play size={24} fill="currentColor" />
                                    </button>
                                    <a
                                        href={song.audioUrl}
                                        download
                                        target="_blank"
                                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                        title="Descarcă Piesa"
                                    >
                                        <Download size={24} />
                                    </a>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-lg truncate text-white group-hover:text-primary transition-colors">{song.title}</h3>
                                <div className="flex items-center justify-between mt-4 text-xs text-gray-500 uppercase tracking-widest">
                                    <span>{song.genre}</span>
                                    <span>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredSongs.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        {songs.length === 0 ? (
                            <p className="text-xl animate-pulse">Se încarcă piesele...</p>
                        ) : (
                            <p className="text-xl">Nu am găsit piese pentru "{searchTerm}"</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
