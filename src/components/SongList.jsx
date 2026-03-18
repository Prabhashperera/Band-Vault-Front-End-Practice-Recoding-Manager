import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, MoreVertical, Music, Play } from 'lucide-react';
// 1. IMPORT YOUR NEW MODAL
import AddSongModal from './AddSongModal';

export default function SongList() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 2. ADD STATE FOR THE MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);

  // We move the fetch logic into its own reusable function so the modal can trigger it
  const fetchSongs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/songs/get-songs');
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

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden text-gray-100 pb-28 font-sans selection:bg-white/30">
      
      {/* 3. PLACE THE MODAL COMPONENT */}
      <AddSongModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSongAdded={fetchSongs} // Refreshes the list when a song is successfully saved
      />

      {/* Ambient Spatial Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>

      {/* Floating Spatial Header */}
      <header className="sticky top-0 z-30 px-4 pt-12 pb-6">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-3xl font-medium tracking-tight text-white/90 drop-shadow-md">
            Hymns Vault
          </h1>
          
          {/* Header Add Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] hover:bg-white/20 transition-all text-white/80 hover:text-white"
            onClick={() => setIsModalOpen(true)} // 4. OPEN MODAL ON CLICK
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        {/* ... (Search Bar code remains exactly the same) ... */}
        <div className="relative group mx-2">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)]"></div>
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5 group-focus-within:text-white transition-colors z-10" />
          <input 
            type="text"
            placeholder="Search your library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative w-full bg-transparent py-3.5 pl-14 pr-6 text-white placeholder-white/40 focus:outline-none focus:bg-white/5 rounded-full transition-all z-10"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 mt-4 relative z-20">
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-white/50">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="p-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-4"
            >
              <Music className="h-6 w-6" />
            </motion.div>
            <p className="text-sm font-medium tracking-wide">Syncing data...</p>
          </div>
        )}

        {/* List View */}
        {!isLoading && (
          <div className="space-y-3 px-2">
            {filteredSongs.map((song, index) => {
              const dateAdded = new Date(song.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });

              return (
                <Link to={`/song/${song._id}`} key={song._id} className="block outline-none">
                  {/* ... (Song Item code remains exactly the same) ... */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.12)" }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all"
                  >
                    <div className="flex items-center gap-4 overflow-hidden w-full">
                      <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                        {song.imageUrl ? (
                          <img src={song.imageUrl} alt={song.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md">
                            <Music className="h-6 w-6 text-white/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <Play className="h-6 w-6 text-white fill-white drop-shadow-md" />
                        </div>
                      </div>
                      <div className="flex flex-col truncate pr-2">
                        <h3 className="text-[17px] font-medium text-white/90 truncate tracking-tight">{song.title}</h3>
                        <p className="text-[13px] text-white/50 truncate mt-0.5">Added {dateAdded}</p>
                      </div>
                    </div>
                    <button className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors" onClick={(e) => { e.preventDefault(); }}>
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </motion.div>
                </Link>
              );
            })}

            {!isLoading && filteredSongs.length === 0 && (
              <div className="text-center py-20 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <Music className="h-10 w-10 text-white/20 mx-auto mb-4" />
                <p className="text-lg font-medium text-white/80">Your vault is empty</p>
                <p className="text-sm text-white/40 mt-1">Tap the plus button to add music.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button (Optional - you can remove this since you have the header button) */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)} // 5. OPEN MODAL ON CLICK
        className="fixed bottom-10 right-6 h-14 w-14 bg-white/10 backdrop-blur-3xl border border-white/20 text-white rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(255,255,255,0.1)] transition-all z-40 group"
      >
        <Plus className="h-6 w-6 text-white/80 group-hover:text-white transition-colors" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
      </motion.button>

    </div>
  );
}