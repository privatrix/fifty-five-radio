
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRadio } from '@/context/RadioContext';
import { Play, Pause, Music, Radio } from 'lucide-react';

export default function Home() {
  const { currentSong, liveSong, isPlaying, isLive, togglePlay, goLive } = useRadio(); // destructure liveSong
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // If not live, play/pause controls in the Center Card should likely control the LIVE stream (rejoin) or just show status?
  // User request: "live radio must be separate, and always live"
  // So the center card represents the LIVE STATION.

  return (
    <>
      <Head>
        <title>55.md - Radio AI Moldova</title>
        <meta name="description" content="Primul Radio Generat de AI din Moldova" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20 z-0 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse z-0" />

        <div className="z-10 text-center max-w-4xl mx-auto space-y-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-2">
              <span className="text-white">55</span>
              <span className="text-primary">.md</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide uppercase">
              Primul Radio Generat de AI din Moldova
            </p>
          </motion.div>

          {/* Live Status Card - ALWAYS SHOWS LIVE SONG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl max-w-lg mx-auto shadow-2xl relative overflow-hidden group hover:border-primary/50 transition-colors"
          >
            <div className="absolute top-0 right-0 p-3">
              <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="text-xs font-bold text-red-500 tracking-widest">ÎN DIRECT</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-left">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden shadow-lg">
                {liveSong ? (
                  <img src={liveSong.coverUrl} alt="Copertă Album" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-800 animate-pulse" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Assuming this play button joins the live stream if not live? */}
                  <button onClick={isLive ? togglePlay : goLive} className="text-white transform hover:scale-110 transition">
                    {/* If we are LIVE and playing, pause. If we are LIVE and paused, play. 
                        If we are NOT live (previewing), this should probably 'Go Live' */}
                    {isLive && isPlaying ? <Pause size={32} /> : <Play size={32} />}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Acum Se Redă (Live)</p>
                <h3 className="text-2xl font-bold text-white truncate w-full">
                  {liveSong?.title || "Se încarcă..."}
                </h3>
              </div>
            </div>

            {/* If user is previewing a DIFFERENT song, show a small banner? */}
            {!isLive && currentSong && (
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-yellow-400">
                <p>Asculți în avanpremieră: <span className="font-bold text-white">{currentSong.title}</span></p>
              </div>
            )}

            {/* Visualizer Lines (Decoration) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 flex items-end opacity-30">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-primary mx-[1px]"
                  animate={{ height: ['10%', '100%', '30%'] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5 + Math.random() * 0.5,
                    delay: i * 0.05
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 pt-8"
          >
            <button
              onClick={isLive ? togglePlay : goLive}
              className={`px-8 py-4 ${isLive ? 'bg-white text-black' : 'bg-red-500 text-white animate-pulse'} font-bold rounded-full hover:opacity-90 transition-all flex items-center gap-2`}
            >
              {isLive && isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isLive ? (isPlaying ? 'PAUZĂ RADIO' : 'ASCULTĂ LIVE') : 'REVIN-O ÎN DIRECT'}
            </button>

            <Link
              href="/library"
              className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Music size={20} />
              BIBLIOTECĂ
            </Link>
          </motion.div>

        </div>
      </main>
    </>
  );
}
