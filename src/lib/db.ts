
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/songs.json');

export interface Song {
    id: string;
    title: string;
    // artist field removed
    duration: number; // seconds
    coverUrl: string;
    audioUrl: string;
    genre: string;
    createdAt?: number;
}

export function getSongs(): Song[] {
    try {
        const fileContents = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error("Error reading DB:", error);
        return [];
    }
}

export function saveSongs(songs: Song[]) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(songs, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to DB:", error);
    }
}

export function addSong(song: Song) {
    const songs = getSongs();
    songs.push(song);
    saveSongs(songs);
}

export function updateSong(updatedSong: Song) {
    let songs = getSongs();
    const index = songs.findIndex(s => s.id === updatedSong.id);
    if (index !== -1) {
        songs[index] = updatedSong;
        saveSongs(songs);
        return true;
    }
    return false;
}

export function reorderSongs(newOrder: Song[]) {
    saveSongs(newOrder);
}

export function deleteSong(id: string) {
    let songs = getSongs();
    songs = songs.filter(s => s.id !== id);
    saveSongs(songs);
}
