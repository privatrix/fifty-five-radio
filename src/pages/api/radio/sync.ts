import type { NextApiRequest, NextApiResponse } from 'next';
import { getSongs } from '@/lib/db';
import { getRadioState } from '@/lib/radioStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const songs = getSongs();

    if (songs.length === 0) {
        return res.status(200).json({ currentSong: null, position: 0 });
    }

    // The scheduler now does all the math. 
    // We just pass it the playlist (the "tape"), and it tells us where the needle is.
    const { currentSong, position } = getRadioState(songs);

    return res.status(200).json({
        currentSong,
        position,
        timestamp: Date.now()
    });
}
