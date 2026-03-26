import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2, Music, Play } from 'lucide-react';
import AddSongModal from './AddSongModal';

export default function SongList() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSongs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-songs`);
      const data = await response.json();
      setSongs(data.songs || []); 
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // --- DELETE FUNCTION ---
  const handleDeleteSong = async (e, songId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this song and all its recordings?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delete-song/${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete the song');

      setSongs((prevSongs) => prevSongs.filter((song) => song._id !== songId));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Could not delete the song. Please try again.");
    }
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-black relative text-gray-100 pb-28 font-sans selection:bg-white/30">
      
      <AddSongModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSongAdded={fetchSongs}
      />

      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none z-0"></div>

      <header className="sticky top-0 z-30 px-4 pt-10 pb-4 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center mb-5 px-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white/90">
            Hymns Vault
          </h1>
        </div>

        {/* Compact Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white/10 rounded-xl transition-colors"></div>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4 group-focus-within:text-white transition-colors z-10" />
          <input 
            type="text"
            placeholder="Search your library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative w-full bg-transparent py-3 pl-11 pr-4 text-[15px] text-white placeholder-white/40 focus:outline-none rounded-xl transition-all z-10"
          />
        </div>
      </header>

      <main className="px-2 mt-2 relative z-20">
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-white/50">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="mb-4">
              <Music className="h-6 w-6 text-white/30" />
            </motion.div>
            <p className="text-sm font-medium tracking-wide">Syncing data...</p>
          </div>
        )}

        {!isLoading && (
          <div className="flex flex-col">
            {filteredSongs.map((song, index) => {
              const dateAdded = new Date(song.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });

              return (
                <Link to={`/song/${song._id}`} key={song._id} className="block outline-none group">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className="flex items-center justify-between py-3 px-2 border-b border-white/5 active:bg-white/5 md:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden w-full">
                      
                      {/* Compact Image */}
                      <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/5">
                        {song.imageUrl ? (
                          <img src={song.imageUrl} alt={song.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Music className="h-5 w-5 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="h-4 w-4 text-white fill-white" />
                        </div>
                      </div>

                      {/* Text Data */}
                      <div className="flex flex-col truncate pr-4">
                        <h3 className="text-[16px] font-medium text-white/90 truncate tracking-tight">{song.title}</h3>
                        <p className="text-[12px] text-white/50 truncate mt-0.5">Added {dateAdded}</p>
                      </div>
                    </div>
                    
                    {/* Minimal Delete Button */}
                    <button 
                      className="p-2 -mr-2 text-white/20 hover:text-red-400 active:bg-red-500/10 rounded-full transition-colors z-10" 
                      onClick={(e) => handleDeleteSong(e, song._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </motion.div>
                </Link>
              );
            })}

            {!isLoading && filteredSongs.length === 0 && (
              <div className="text-center py-20">
                <Music className="h-10 w-10 text-white/10 mx-auto mb-4" />
                <p className="text-lg font-medium text-white/60">Your vault is empty</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-6 h-14 w-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(255,255,255,0.2)] transition-all z-40"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </motion.button>

    </div>
  );
}