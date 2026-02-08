
import { Song } from "@/data/songs";

export interface RadioState {
    currentSong: Song | null;
    nextSong: Song | null;
    position: number; // Current position in seconds
    startTime: number; // Timestamp when song started
}

export function getRadioState(songs: Song[]): RadioState {
    if (!songs || songs.length === 0) {
        return {
            currentSong: null,
            nextSong: null,
            position: 0,
            startTime: 0
        };
    }

    const now = Date.now() / 1000;

    // Calculate total playlist duration
    const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);

    if (totalDuration === 0) {
        return {
            currentSong: songs[0],
            nextSong: songs[0],
            position: 0,
            startTime: 0
        };
    }

    // Calculate current position in the total loop
    const loopPosition = now % totalDuration;

    let accumulatedTime = 0;
    let currentSong = songs[0];
    let nextSong = songs[1] || songs[0];
    let songStartTime = 0;

    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        if (loopPosition >= accumulatedTime && loopPosition < accumulatedTime + song.duration) {
            currentSong = song;
            nextSong = songs[(i + 1) % songs.length];
            songStartTime = now - (loopPosition - accumulatedTime);
            break;
        }
        accumulatedTime += song.duration;
    }

    return {
        currentSong,
        nextSong,
        position: now - songStartTime,
        startTime: songStartTime,
    };
}
