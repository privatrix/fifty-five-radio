
import fs from 'fs';
import path from 'path';
import { Song } from './db';

// Store in .next to avoid watcher restart loop (temporary but effective for dev)
// Ideally use a real database or a file outside project root.
const STATE_FILE = path.join(process.cwd(), '.next/radio_state.json');

// Global cache to prevent file locking collisions on Windows
declare global {
    var _radioStateCache: RadioState | undefined;
}

export interface RadioState {
    currentSongId: string;
    startedAt: number; // Unix timestamp in ms
}

export function getRadioState(): RadioState {
    // 1. Try Cache
    if (global._radioStateCache) {
        return global._radioStateCache;
    }

    try {
        if (!fs.existsSync(STATE_FILE)) {
            // Create if not exists
            return { currentSongId: '', startedAt: 0 };
        }
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        const state = JSON.parse(data);

        // Populate Cache
        global._radioStateCache = state;
        return state;
    } catch (error) {
        console.error("Error reading radio state:", error);
        // Do NOT return default if we can help it, but for now we must.
        // If we fail to read, we risk resetting.
        // Better: Return the last known cache if available? We checked cache first.
        return { currentSongId: '', startedAt: 0 };
    }
}

export function saveRadioState(state: RadioState) {
    // 1. Update Cache
    global._radioStateCache = state;

    // 2. Persist to Disk (Async-ish safe)
    try {
        const dir = path.dirname(STATE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
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
