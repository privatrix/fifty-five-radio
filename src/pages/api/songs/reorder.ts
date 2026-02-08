
import type { NextApiRequest, NextApiResponse } from 'next';
import { reorderSongs, Song } from '@/lib/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { songs } = req.body;

        if (!songs || !Array.isArray(songs)) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        reorderSongs(songs);
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
