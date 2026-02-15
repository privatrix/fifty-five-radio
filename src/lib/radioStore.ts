
import fs from 'fs';
import path from 'path';
import { Song } from './db';

const STATE_FILE = path.join(process.cwd(), 'src/data/radio_state.json');

export interface RadioState {
    currentSongId: string;
    startedAt: number; // Unix timestamp in ms
}

export function getRadioState(): RadioState {
    try {
        if (!fs.existsSync(STATE_FILE)) {
            return { currentSongId: '', startedAt: 0 };
        }
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading radio state:", error);
        return { currentSongId: '', startedAt: 0 };
    }
}

export function saveRadioState(state: RadioState) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing radio state:", error);
    }
}

export function advanceTrack(songs: Song[], currentState: RadioState): RadioState {
    if (!songs || songs.length === 0) return currentState;

    const currentIndex = songs.findIndex(s => s.id === currentState.currentSongId);
    let nextIndex = 0;

    if (currentIndex !== -1) {
        nextIndex = (currentIndex + 1) % songs.length;
    }

    const nextSong = songs[nextIndex];

    // If we are advancing, the new start time should ideally be "when the last one ended" 
    // to keep the timeline continuous, BUT if the server was down or nobody checked, 
    // it implies we might be way behind. 
    // Simple stateful radio: "Next song starts NOW". 
    // This is safer for drift.
    const newState = {
        currentSongId: nextSong.id,
        startedAt: Date.now()
    };

    saveRadioState(newState);
    return newState;
}

// Ensure the file exists on startup (or first call)
if (!fs.existsSync(STATE_FILE)) {
    // We don't have songs here easily without circular dep or extra read, 
    // so we'll let the API handler initialize it if empty.
}
