
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSongs } from '@/lib/db';
import { getRadioState, saveRadioState, advanceTrack } from '@/lib/radioStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const songs = getSongs();

    if (songs.length === 0) {
        return res.status(200).json({ currentSong: null, position: 0 });
    }

    let state = getRadioState();

    // Initialize if empty
    if (!state.currentSongId) {
        state = {
            currentSongId: songs[0].id,
            startedAt: Date.now()
        };
        saveRadioState(state);
    }

    let currentSong = songs.find(s => s.id === state.currentSongId);

    // If song deleted or not found, reset
    if (!currentSong) {
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
    if (elapsed >= currentSong.duration) {
        // Advance track
        // We might need to advance multiple times if we missed a lot, 
        // but for now let's just go to next. 
        // Logic: specific "next" is better than looping to fix giant gaps.

        state = advanceTrack(songs, state);
        currentSong = songs.find(s => s.id === state.currentSongId) || songs[0];

        // Recalculate position (should be close to 0)
        const newElapsed = (Date.now() - state.startedAt) / 1000;

        return res.status(200).json({
            currentSong,
            position: newElapsed,
            timestamp: Date.now()
        });
    }

    return res.status(200).json({
        currentSong,
        position: elapsed,
        timestamp: Date.now()
    });
}
