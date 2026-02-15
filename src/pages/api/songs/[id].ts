
import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteSong, getSongs, updateSong, Song } from '@/lib/db';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream for uploads
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    if (req.method === 'DELETE') {
        // Optional: Delete physical files too
        const songs = getSongs();
        const songToDelete = songs.find(s => s.id === id);
        if (songToDelete) {
            try {
                if (songToDelete.audioUrl.startsWith('/uploads/')) {
                    const audioPath = path.join(process.cwd(), 'public', songToDelete.audioUrl);
                    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
                }
                if (songToDelete.coverUrl.startsWith('/uploads/')) {
                    const coverPath = path.join(process.cwd(), 'public', songToDelete.coverUrl);
                    if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
                }
            } catch (e) {
                console.error("Error deleting files:", e);
            }
        }

        deleteSong(id);
        return res.status(200).json({ success: true });
    }

    if (req.method === 'PUT') {
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
            uploadDir,
            keepExtensions: true,
        });

        try {
            const [fields, files] = await form.parse(req);

            const songs = getSongs();
            const existingSong = songs.find(s => s.id === id);

            if (!existingSong) {
                return res.status(404).json({ error: "Song not found" });
            }

            const title = fields.title?.[0] || existingSong.title;
            const genre = fields.genre?.[0] || existingSong.genre;
            // distinct parsing for duration
            const durationInput = fields.duration?.[0];
            const duration = durationInput ? parseInt(durationInput) : existingSong.duration;

            // If a new cover is uploaded, delete old one and use new
            let coverUrl = existingSong.coverUrl;
            if (files.cover?.[0]) {
                coverUrl = `/uploads/${path.basename(files.cover[0].newFilename)}`;
            }

            const updatedSong: Song = {
                ...existingSong,
                title,
                genre,
                duration,
                coverUrl
            };

            updateSong(updatedSong);
            return res.status(200).json(updatedSong);

        } catch (e) {
            console.error("Update failed", e);
            return res.status(500).json({ error: "Update failed" });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
