import fs from 'fs';
import path from 'path';
import os from 'os';
import { Song } from './db';

// Use OS temp dir to guarantee write access and avoid project file watchers
const STATE_FILE = path.join(os.tmpdir(), 'radio_state.json');
const LOG_FILE = path.join(os.tmpdir(), 'radio_debug.log');

// Global cache to prevent file locking collisions on Windows
declare global {
    var _radioStateCache: RadioState | undefined;
}

function logDebug(msg: string) {
    try {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        // ignore
    }
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
            logDebug(`State file missing at ${STATE_FILE}, returning default.`);
            return { currentSongId: '', startedAt: 0 };
        }
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        const state = JSON.parse(data);

        logDebug(`Loaded state from ${STATE_FILE}: ${JSON.stringify(state)}`);

        // Populate Cache
        global._radioStateCache = state;
        return state;
    } catch (error) {
        logDebug(`Error reading state from ${STATE_FILE}: ${error}`);
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
    logDebug(`Saving state to ${STATE_FILE}: ${JSON.stringify(state)}`);

    // 2. Persist to Disk (Async-ish safe)
    try {
        // os.tmpdir() usually guarantees the directory exists and is writable.
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (error) {
        logDebug(`Error writing state: ${error}`);
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
