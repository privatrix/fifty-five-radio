
export interface Song {
    id: string;
    title: string;
    // artist field removed
    duration: number; // seconds
    coverUrl: string;
    audioUrl: string;
    genre: string;
}

export const songs: Song[] = [
    {
        id: "1",
        title: "Orizont Neon",
        duration: 180,
        coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        genre: "Synthwave"
    },
    {
        id: "2",
        title: "Vise Cibernetice",
        duration: 215,
        coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        genre: "Cyberpunk"
    },
    {
        id: "3",
        title: "Ploaie Digitală",
        duration: 195,
        coverUrl: "https://images.unsplash.com/photo-1515630278258-407f66498911?w=500&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        genre: "Ambient"
    },
    {
        id: "4",
        title: "Viitorul Moldovei",
        duration: 240,
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        genre: "Pop"
    },
    {
        id: "5",
        title: "Bas Neural",
        duration: 170,
        coverUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&auto=format&fit=crop&q=60",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        genre: "Drum & Bass"
    }
];
