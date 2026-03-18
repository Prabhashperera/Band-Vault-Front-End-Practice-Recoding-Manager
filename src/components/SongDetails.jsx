import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic2, Star, Upload, Music } from 'lucide-react';

export default function SongDetails() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FORM STATE ---
  const [recTitle, setRecTitle] = useState('');
  const [recSinger, setRecSinger] = useState('');
  const [recKey, setRecKey] = useState('');
  const [recNotes, setRecNotes] = useState('');
  const [recAudio, setRecAudio] = useState(null);
  const [recIsFinal, setRecIsFinal] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // --- FETCH DATA ---
  const fetchSongData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-recordings/${id}/recordings`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setSong({
        title: data.title,
        imageUrl: data.imageUrl // This will now work thanks to the backend update
      });

      setRecordings(data.recordings || []);
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSongData();
  }, [id]);


  // --- HANDLE FORM SUBMIT ---
  const handleAddRecording = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!recTitle || !recAudio) {
      setFormError('Title and Audio File are required.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', recTitle);
    formData.append('singer', recSinger);
    formData.append('key', recKey);
    formData.append('notes', recNotes);
    
    // UPDATED: Must match backend schema "isFinalVersion"
    formData.append('isFinalVersion', recIsFinal); 
    
    // Must match backend upload.single("audio")
    formData.append('audio', recAudio);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/save-record/${id}/recordings`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      // Clear the form
      setRecTitle('');
      setRecSinger('');
      setRecKey('');
      setRecNotes('');
      setRecAudio(null);
      setRecIsFinal(false);

      // Refresh data
      await fetchSongData();

    } catch (error) {
      console.error("Upload error:", error);
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- RENDER STATES ---
  if (isLoading && !song) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white/50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <Music className="h-8 w-8 mb-4" />
        </motion.div>
        <p>Loading vault details...</p>
      </div>
    );
  }

  if (!song) {
    return <div className="w-full min-h-screen bg-black text-white/50 flex justify-center pt-20">Song not found</div>;
  }

  // --- MAIN RENDER ---
  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden text-gray-100 font-sans selection:bg-white/30 pb-20">
      
      {/* Ambient Spatial Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[150px] pointer-events-none z-0"></div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-7xl mx-auto px-6 pt-12 space-y-12"
      >
        {/* Navigation */}
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Library</span>
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/10 flex-shrink-0 bg-white/5 backdrop-blur-xl"
          >
            {song.imageUrl ? (
              <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Music className="h-12 w-12 text-white/20" /></div>
            )}
          </motion.div>
          <div className="space-y-4 pt-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white/90 drop-shadow-md">{song.title}</h1>
            <p className="text-xl text-white/50 font-medium tracking-wide">Added to vault</p>
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Content Layout */}
        <div className="grid lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Column: Recordings List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-medium flex items-center gap-3 text-white/90">
                <Mic2 className="h-6 w-6 text-white/50" />
                Recordings
              </h2>
              <span className="text-sm text-white/60 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">
                {recordings.length} versions
              </span>
            </div>

            <div className="space-y-4">
              {recordings.map((recording, index) => (
                <motion.div 
                  key={recording._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                >
                  {/* UPDATED: isFinalVersion mapping */}
                  {recording.isFinalVersion && (
                    <div className="absolute top-5 right-5 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-yellow-200 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full backdrop-blur-md">
                      <Star className="h-3 w-3 fill-yellow-200" /> Final
                    </div>
                  )}
                  
                  <div className="mb-5">
                    <h3 className="text-xl font-medium text-white/90">{recording.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-white/50 mt-2">
                      {recording.singer && <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">👤 {recording.singer}</span>}
                      {recording.key && <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">🎵 Key: {recording.key}</span>}
                    </div>
                  </div>
                  
                  {recording.notes && (
                    <p className="text-sm text-white/70 mb-6 bg-black/20 border border-white/5 p-4 rounded-2xl leading-relaxed">
                      {recording.notes}
                    </p>
                  )}

                  {/* UPDATED: cloudUrl mapping for Audio Player */}
                  {recording.cloudUrl && (
                    <div className="bg-white/5 rounded-2xl p-2 border border-white/10 backdrop-blur-md">
                      <audio controls className="w-full h-10 outline-none opacity-80 hover:opacity-100 transition-opacity">
                        <source src={recording.cloudUrl} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                </motion.div>
              ))}

              {recordings.length === 0 && (
                <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 backdrop-blur-sm">
                  <Mic2 className="h-8 w-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 font-medium">No recordings yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Add Recording Form */}
          <div className="sticky top-24">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h3 className="text-xl font-medium mb-6 text-white/90 tracking-tight">Add Recording</h3>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                  {formError}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleAddRecording}>
                
                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Title *</label>
                  <input 
                    type="text" 
                    value={recTitle}
                    onChange={(e) => setRecTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-white/30 focus:border-white/30 focus:bg-white/5 focus:outline-none transition-all" 
                    placeholder="e.g., Sunday Service Live" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Singer/Band</label>
                    <input 
                      type="text" 
                      value={recSinger}
                      onChange={(e) => setRecSinger(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-white/30 focus:border-white/30 focus:bg-white/5 focus:outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Key</label>
                    <input 
                      type="text" 
                      value={recKey}
                      onChange={(e) => setRecKey(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-white/30 focus:border-white/30 focus:bg-white/5 focus:outline-none transition-all" 
                      placeholder="e.g., G Major" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Notes</label>
                  <textarea 
                    rows="3" 
                    value={recNotes}
                    onChange={(e) => setRecNotes(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-white/30 focus:border-white/30 focus:bg-white/5 focus:outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Audio File *</label>
                  <label className="flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all rounded-2xl p-6 text-center cursor-pointer group bg-black/20">
                    <Upload className="h-6 w-6 text-white/40 mb-3 group-hover:text-white/80 transition-colors" />
                    <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">
                      {recAudio ? recAudio.name : "Select MP3 or WAV"}
                    </span>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={(e) => setRecAudio(e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3 py-2 px-1">
                  <input 
                    type="checkbox" 
                    id="isFinal" 
                    checked={recIsFinal}
                    onChange={(e) => setRecIsFinal(e.target.checked)}
                    className="w-5 h-5 rounded-md border-white/20 text-white focus:ring-white/30 bg-black/40 cursor-pointer appearance-none checked:bg-white checked:border-white relative before:content-['✓'] before:absolute before:text-black before:text-xs before:font-bold before:left-[3px] before:top-[1px] before:opacity-0 checked:before:opacity-100 transition-all" 
                  />
                  <label htmlFor="isFinal" className="text-sm text-white/70 cursor-pointer select-none">Mark as Final Version</label>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  type="submit" 
                  className={`w-full text-black font-medium py-3.5 rounded-2xl transition-all mt-4 ${isSubmitting ? 'bg-white/50 cursor-not-allowed' : 'bg-white shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.3)]'}`}
                >
                  {isSubmitting ? 'Uploading...' : 'Upload Recording'}
                </motion.button>
              </form>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}