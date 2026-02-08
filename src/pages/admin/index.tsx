
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRadio } from '@/context/RadioContext';
import { Trash2, Upload, Lock, Plus, Music, Image as ImageIcon, ArrowUp, ArrowDown, Edit2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Song } from '@/lib/db';

export default function Admin() {
    const { songs, refreshSongs } = useRadio();
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Form State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');

    // Edit State
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const editCoverInputRef = useRef<HTMLInputElement>(null);

    // Persist Login
    useEffect(() => {
        if (localStorage.getItem('adminAuth') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin55') {
            setIsAuthenticated(true);
            localStorage.setItem('adminAuth', 'true');
        } else {
            alert('Parolă incorectă');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuth');
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadError('');
        if (!fileInputRef.current?.files?.[0] || !title) {
            setUploadError('Te rog completează Titlul și selectează un fișier Audio.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('genre', genre || 'Unknown');
        formData.append('audio', fileInputRef.current.files[0]);
        formData.append('duration', '180'); // Mock duration

        if (coverInputRef.current?.files?.[0]) {
            formData.append('cover', coverInputRef.current.files[0]);
        }

        try {
            const res = await fetch('/api/songs', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                await refreshSongs();
                setTitle('');
                setGenre('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (coverInputRef.current) coverInputRef.current.value = '';
                alert('Piesă încărcată cu succes!');
            } else {
                const data = await res.json();
                setUploadError(data.error || 'Eroare la încărcare');
            }
        } catch (err) {
            console.error(err);
            setUploadError('Eroare de conexiune');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Sigur vrei să ștergi "${name}"?`)) return;

        try {
            const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await refreshSongs();
            } else {
                alert('Eroare la ștergere');
            }
        } catch (err) {
            alert('Eroare de conexiune');
        }
    };

    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        if (uploading) return;
        const newSongs = [...songs];

        if (direction === 'up') {
            if (index === 0) return;
            [newSongs[index], newSongs[index - 1]] = [newSongs[index - 1], newSongs[index]];
        } else {
            if (index === songs.length - 1) return;
            [newSongs[index], newSongs[index + 1]] = [newSongs[index + 1], newSongs[index]];
        }

        // Optimistic UI Update is risky if API fails, but better for UX.
        // We actually need to update the local state immediately via refreshSongs logic or direct state mutation?
        // refreshSongs fetches from server. So we should wait for server.
        // But to make it feel responsive, we might need a local setSongs? 
        // RadioContext exposes setSongs? No. It exposes refreshSongs.
        // So we must rely on API saving correctly.

        setUploading(true); // Lock interface
        try {
            // Debug log
            console.log("Sending reorder request", newSongs.map(s => s.id));

            const res = await fetch('/api/songs/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songs: newSongs })
            });

            if (res.ok) {
                await refreshSongs();
            } else {
                alert("Eroare la salvarea ordinii (Server)");
            }
        } catch (e) {
            console.error("Failed to reorder", e);
            alert("Eroare conexiune reorder");
        } finally {
            setUploading(false);
        }
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSong) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('title', editingSong.title);
        formData.append('genre', editingSong.genre);

        if (editCoverInputRef.current?.files?.[0]) {
            formData.append('cover', editCoverInputRef.current.files[0]);
        }

        try {
            const res = await fetch(`/api/songs/${editingSong.id}`, {
                method: 'PUT',
                body: formData
            });

            if (res.ok) {
                await refreshSongs();
                setEditingSong(null);
                alert("Modificări salvate!");
            } else {
                alert('Eroare la actualizare');
            }
        } catch (e) {
            console.error(e);
            alert("Eroare conexiune edit");
        } finally {
            setUploading(false);
        }
    };


    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Head><title>Admin Login - 55.md</title></Head>
                <motion.form
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onSubmit={handleLogin}
                    className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-6"
                >
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-2">Admin 55.md</h1>
                        <p className="text-gray-400">Login pentru administrare</p>
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="password"
                            placeholder="Parolă"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors text-white"
                        />
                    </div>

                    <button type="submit" className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 rounded-lg transition-colors">
                        Intră
                    </button>
                </motion.form>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-32 px-4 max-w-6xl mx-auto">
            <Head><title>Dashboard - 55.md</title></Head>

            <div className="flex items-center justify-between mb-12">
                <h1 className="text-4xl font-bold">Panou Administrare</h1>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Deconectare</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Upload Form */}
                <div className="space-y-8">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Upload size={24} className="text-primary" />
                            Upload Piesă Nouă
                        </h2>

                        {uploadError && (
                            <div className="bg-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm font-bold">
                                {uploadError}
                            </div>
                        )}

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Titlu Piesă *</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-primary outline-none" placeholder="Ex: Melodie Nouă" />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Gen Muzical</label>
                                <input type="text" value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-primary outline-none" placeholder="Ex: House, Pop..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/30 p-4 rounded-lg border border-dashed border-white/20 hover:border-primary/50 transition cursor-pointer relative">
                                    <input ref={fileInputRef} type="file" accept="audio/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                                        <Music size={24} />
                                        <span className="text-xs">Fișier Audio *</span>
                                    </div>
                                </div>
                                <div className="bg-black/30 p-4 rounded-lg border border-dashed border-white/20 hover:border-primary/50 transition cursor-pointer relative">
                                    <input ref={coverInputRef} type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                                        <ImageIcon size={24} />
                                        <span className="text-xs">Copertă (Opțional)</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 mt-4 
                            ${uploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'}`}
                            >
                                {uploading ? 'Se încarcă...' : <><Plus size={20} /> Adaugă Piesă</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Song List */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Piese Existente ({songs.length})</h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        <AnimatePresence>
                            {songs.map((song, index) => (
                                <motion.div
                                    key={song.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center gap-1 mr-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleReorder(index, 'up')}
                                                disabled={index === 0 || uploading}
                                                className="hover:text-primary disabled:opacity-30 disabled:hover:text-current p-1"
                                                title="Mută mai sus"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleReorder(index, 'down')}
                                                disabled={index === songs.length - 1 || uploading}
                                                className="hover:text-primary disabled:opacity-30 disabled:hover:text-current p-1"
                                                title="Mută mai jos"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                        </div>
                                        <img src={song.coverUrl} className="w-12 h-12 rounded-lg object-cover bg-black" />
                                        <div>
                                            <h3 className="font-bold">{song.title}</h3>
                                            <p className="text-xs text-gray-400">{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingSong(song)}
                                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            title="Editează"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(song.id, song.title)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Șterge"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingSong && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1a] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
                        >
                            <button
                                onClick={() => setEditingSong(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold mb-6">Editează</h2>

                            <form onSubmit={handleEditSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Titlu Piesă</label>
                                    <input
                                        type="text"
                                        value={editingSong.title}
                                        onChange={e => setEditingSong({ ...editingSong, title: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Gen</label>
                                    <input
                                        type="text"
                                        value={editingSong.genre}
                                        onChange={e => setEditingSong({ ...editingSong, genre: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Schimbă Coperta (Opțional)</label>
                                    <input
                                        ref={editCoverInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                                >
                                    {uploading ? 'Se salvează...' : <><Save size={18} /> Salvează Modificările</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
