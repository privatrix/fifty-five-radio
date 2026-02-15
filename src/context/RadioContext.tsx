
// Force rebuild
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Howl } from 'howler';
import { Song } from '@/lib/db';

interface RadioContextType {
    currentSong: Song | null;
    liveSong: Song | null;
    isPlaying: boolean;
    togglePlay: () => void;
    volume: number;
    setVolume: (vol: number) => void;
    isLoading: boolean;
    songs: Song[];
    refreshSongs: () => Promise<void>;
    isLive: boolean; // Always true now for "Live Radio" concept, but keeping flag for potential expansion
    getCurrentTime: () => number;
    playTrack: (song: Song) => void;
    goLive: () => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: React.ReactNode }) {
    const [songs, setSongs] = useState<Song[]>([]);

    // "Dumb" State - just holds what server told us
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [serverPosition, setServerPosition] = useState<number>(0);
    const [lastSyncTime, setLastSyncTime] = useState<number>(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isLoading, setIsLoading] = useState(true);

    const soundRef = useRef<Howl | null>(null);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- API Interactions ---

    const refreshSongs = async () => {
        try {
            const res = await fetch('/api/songs');
            const data = await res.json();
            setSongs(data);
            return data;
        } catch (e) {
            console.error("Failed to fetch songs", e);
            return [];
        }
    };

    const fetchSync = async () => {
        try {
            const res = await fetch('/api/radio/sync');
            if (res.ok) {
                const data = await res.json();
                return data as { currentSong: Song | null, position: number, timestamp: number };
            }
        } catch (e) {
            console.error("Sync failed", e);
        }
        return null;
    };

    // --- Core Logic ---

    // 1. Polling Loop (The Heartbeat)
    useEffect(() => {
        const tick = async () => {
            if (!isPlaying) return;

            const state = await fetchSync();
            if (!state || !state.currentSong) return;

            // Update State
            setServerPosition(state.position);
            setLastSyncTime(Date.now());

            // A. Track Change?
            if (currentSong?.id !== state.currentSong.id) {
                console.log(`TRANSITION: ${currentSong ? currentSong.title : 'None'} -> ${state.currentSong.title}`);
                playNewTrack(state.currentSong, state.position);
            }
            // B. Same Track - Check Drift
            else if (soundRef.current) {
                const audioPos = soundRef.current.seek();
                if (typeof audioPos === 'number') {
                    const drift = Math.abs(audioPos - state.position);
                    if (drift > 2.5) {
                        console.log(`DRIFT FIX: Audio=${audioPos.toFixed(1)}s, Server=${state.position.toFixed(1)}s. Seeking.`);
                        soundRef.current.seek(state.position);
                    }
                }
            }
        };

        // Poll frequently (3s) to keep sync tight
        syncIntervalRef.current = setInterval(tick, 3000);

        return () => {
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        };
    }, [isPlaying, currentSong]);

    // 2. Initial Load
    useEffect(() => {
        const init = async () => {
            await refreshSongs();
            setIsLoading(false);
        };
        init();

        return () => {
            if (soundRef.current) soundRef.current.unload();
        };
    }, []);


    // --- Audio Control ---

    const playNewTrack = (song: Song, startSeek: number) => {
        if (soundRef.current) {
            soundRef.current.unload();
        }

        const sound = new Howl({
            src: [song.audioUrl],
            html5: true,
            volume: volume,
            autoplay: true,
            onload: () => {
                // Verify duration again? 
                // For now, trust the server.
            },
            onend: () => {
                console.log("Song ended (locally). Waiting for server to switch track...");
                // Do NOT playNext().
                // Just wait. The polling loop will see the server switch and trigger playNewTrack.
                // We can artificially trigger a poll call here for speed.
                // syncIntervalRef.current... logic is hard to trigger from here without extracting 'tick'.
                // But 3s silence is max worst case.
            }
        });

        sound.seek(startSeek);
        soundRef.current = sound;
        setCurrentSong(song);
        setIsPlaying(true);
        setServerPosition(startSeek);
        setLastSyncTime(Date.now());
        sound.play();
    };

    const togglePlay = async () => {
        if (isPlaying) {
            setIsPlaying(false);
            if (soundRef.current) soundRef.current.pause();
        } else {
            // RESUME / START
            // Always fetch fresh state first!
            setIsLoading(true);
            const state = await fetchSync();
            setIsLoading(false);

            if (state && state.currentSong) {
                // If we have a sound specifically for this song, maybe just resume/seek?
                // For robustness: Just start fresh. It effectively resumes but ensures sync.
                playNewTrack(state.currentSong, state.position);
            }
        }
    };

    const handleSetVolume = (vol: number) => {
        setVolume(vol);
        if (soundRef.current) soundRef.current.volume(vol);
    };

    // UI Helper: Calculate 'current time' based on last known server data + elapsed local time
    const getCurrentTime = () => {
        if (!isPlaying || !currentSong) return 0;
        const timeSinceSync = (Date.now() - lastSyncTime) / 1000;
        return serverPosition + timeSinceSync;
    };

    return (
        <RadioContext.Provider value={{
            currentSong,
            liveSong: currentSong, // For compatibility
            isPlaying,
            togglePlay,
            volume,
            setVolume: handleSetVolume,
            isLoading,
            songs,
            refreshSongs,
            isLive: true,
            playTrack: () => { }, // Disabled manual play
            goLive: () => { }, // Always live
            getCurrentTime
        }}>
            {children}
        </RadioContext.Provider>
    );
}

export function useRadio() {
    const context = useContext(RadioContext);
    if (context === undefined) {
        throw new Error('useRadio must be used within a RadioProvider');
    }
    return context;
}
