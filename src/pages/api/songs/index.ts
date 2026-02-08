
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { getSongs, addSong, Song } from '@/lib/db';

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const songs = getSongs();
        return res.status(200).json(songs);
    }

    if (req.method === 'POST') {
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

            const title = fields.title?.[0];
            const genre = fields.genre?.[0];
            const duration = parseInt(fields.duration?.[0] || '0');

            const audioFile = files.audio?.[0];
            const coverFile = files.cover?.[0];

            if (!title || !audioFile) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newSong: Song = {
                id: Date.now().toString(),
                title,
                genre: genre || 'Unknown',
                duration: duration || 180, // Fallback if 0
                audioUrl: `/uploads/${path.basename(audioFile.newFilename)}`,
                coverUrl: coverFile ? `/uploads/${path.basename(coverFile.newFilename)}` : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=60',
                createdAt: Date.now(),
            };

            addSong(newSong);

            return res.status(201).json(newSong);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Upload failed' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
