import { Song } from './db';

// Pure math. No state. No files.
// This function calculates exactly what should be playing at any given millisecond in history.
export function getRadioState(songs: Song[]) {
    if (!songs || songs.length === 0) {
        return { currentSong: null, position: 0 };
    }

    // 1. Calculate the total length of the "tape loop"
    const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0);

    if (totalDuration === 0) {
        return { currentSong: songs[0], position: 0 };
    }

    // 2. Find where we are on the loop right now
    // Date.now() is ms, so we work in ms context or convert safe.
    // Let's work in SECONDS for simplicity with duration.
    const nowSeconds = Math.floor(Date.now() / 1000);
    const loopPosition = nowSeconds % totalDuration;

    // 3. Find which song corresponds to this position
    let elapsed = 0;
    for (const song of songs) {
        const duration = song.duration || 0;

        // Is the needle inside this song?
        if (loopPosition < elapsed + duration) {
            return {
                currentSong: song,
                position: loopPosition - elapsed // How far into THIS song are we?
            };
        }

        elapsed += duration;
    }

    // Fallback (should be mathematically impossible if logic is sound, but good for safety)
    return { currentSong: songs[0], position: 0 };
}
