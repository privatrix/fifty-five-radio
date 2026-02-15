
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSongs } from '@/lib/db';
import { getRadioState, saveRadioState, advanceTrack } from '@/lib/radioStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const songs = getSongs();

    if (songs.length === 0) {
        return res.status(200).json({ currentSong: null, position: 0 });
    }

    let state = getRadioState();
    console.log("DEBUG: Loaded State:", JSON.stringify(state));

    // Initialize if empty or invalid
    if (!state.currentSongId) {
        console.log("DEBUG: State empty, initializing default.");
        state = {
            currentSongId: songs[0].id,
            startedAt: Date.now()
        };
        saveRadioState(state);
    }

    let currentSong = songs.find(s => s.id === state.currentSongId);
    console.log("DEBUG: Found Song:", currentSong ? currentSong.title : "None", "ID:", state.currentSongId);

    // Safety: If song deleted or not found, reset to first song immediately
    if (!currentSong) {
        console.log("Current song not found in DB, resetting to start.");
        state = {
            currentSongId: songs[0].id,
            startedAt: Date.now()
        };
        saveRadioState(state);
        currentSong = songs[0];
    }

    const now = Date.now();
    const elapsed = (now - state.startedAt) / 1000; // seconds

    // Check if song finished
    // Add a small buffer (1s) to ensure we don't switch TOO early if client clock is slightly ahead
    // But we also want to switch *promptly*. 
    // Let's strictly use server duration.
    if (elapsed >= currentSong.duration) {
        console.log(`Song ${currentSong.title} finished (Elapsed: ${elapsed.toFixed(1)}s / Duration: ${currentSong.duration}s). Advancing.`);

        state = advanceTrack(songs, state);
        currentSong = songs.find(s => s.id === state.currentSongId) || songs[0];

        // Recalculate position for the NEW song
        const newElapsed = (Date.now() - state.startedAt) / 1000;

        return res.status(200).json({
            currentSong,
            position: Math.max(0, newElapsed), // Ensure no negative values
            timestamp: Date.now()
        });
    }

    return res.status(200).json({
        currentSong,
        position: Math.max(0, elapsed),
        timestamp: Date.now()
    });
}
