import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic2, Star, Upload, Music, Edit2, X, Save, ImagePlus, Trash2 } from 'lucide-react';

export default function SongDetails() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ADD FORM STATE ---
  const [recTitle, setRecTitle] = useState('');
  const [recSinger, setRecSinger] = useState('');
  const [recKey, setRecKey] = useState('');
  const [recNotes, setRecNotes] = useState('');
  const [recAudio, setRecAudio] = useState(null);
  const [recIsFinal, setRecIsFinal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // --- EDIT SONG STATE ---
  const [isEditSongOpen, setIsEditSongOpen] = useState(false);
  const [editSongData, setEditSongData] = useState({ title: '', composer: '', image: null });
  const [isSavingSong, setIsSavingSong] = useState(false);

  // --- EDIT RECORDING STATE ---
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editRecData, setEditRecData] = useState({ title: '', singer: '', key: '', notes: '', isFinalVersion: false, audio: null });
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  // --- FETCH DATA ---
  const fetchSongData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-recordings/${id}/recordings`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
      const data = await response.json();
      setSong({
        title: data.title,
        imageUrl: data.imageUrl,
        composer: data.composer || '' 
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

  // --- HANDLE ADD RECORDING ---
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
    formData.append('isFinalVersion', recIsFinal); 
    formData.append('audio', recAudio);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/save-record/${id}/recordings`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload recording');
      
      setRecTitle(''); setRecSinger(''); setRecKey(''); setRecNotes(''); setRecAudio(null); setRecIsFinal(false);
      await fetchSongData();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLE EDIT SONG ---
  const openEditSong = () => {
    setEditSongData({ title: song.title, composer: song.composer || '', image: null });
    setIsEditSongOpen(true);
  };

  const handleEditSongSubmit = async (e) => {
    e.preventDefault();
    setIsSavingSong(true);
    const formData = new FormData();
    if (editSongData.title) formData.append('title', editSongData.title);
    if (editSongData.composer) formData.append('composer', editSongData.composer);
    if (editSongData.image) formData.append('image', editSongData.image);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/edit-song/${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update song');
      setIsEditSongOpen(false);
      await fetchSongData();
    } catch (error) {
      console.error(error);
      alert("Failed to update song details.");
    } finally {
      setIsSavingSong(false);
    }
  };

  // --- HANDLE EDIT RECORDING ---
  const openEditRecord = (recording) => {
    setEditRecData({
      title: recording.title,
      singer: recording.singer || '',
      key: recording.key || '',
      notes: recording.notes || '',
      isFinalVersion: recording.isFinalVersion || false,
      audio: null
    });
    setEditingRecordId(recording._id);
  };

  const handleEditRecordSubmit = async (e) => {
    e.preventDefault();
    setIsSavingRecord(true);
    const formData = new FormData();
    formData.append('title', editRecData.title);
    formData.append('singer', editRecData.singer);
    formData.append('key', editRecData.key);
    formData.append('notes', editRecData.notes);
    formData.append('isFinalVersion', editRecData.isFinalVersion);
    if (editRecData.audio) formData.append('audio', editRecData.audio);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/edit-record/${id}/recordings/${editingRecordId}`, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update recording');
      setEditingRecordId(null);
      await fetchSongData();
    } catch (error) {
      console.error(error);
      alert("Failed to update recording.");
    } finally {
      setIsSavingRecord(false);
    }
  };

      // --- HANDLE DELETE RECORDING ---
  const handleDeleteRecording = async (recordingId) => {
    // Show a confirmation popup so the user doesn't delete by accident
    if (!window.confirm("Are you sure you want to delete this recording? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delete-record/${id}/recordings/${recordingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete recording');
      
      // Refresh the data to remove it from the screen
      await fetchSongData();
      
    } catch (error) {
      console.error(error);
      alert("Failed to delete recording.");
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

  if (!song) return <div className="w-full min-h-screen bg-black text-white/50 flex justify-center pt-20">Song not found</div>;

  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden text-gray-100 font-sans selection:bg-white/30 pb-20">
      
      {/* Ambient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[150px] pointer-events-none z-0"></div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 max-w-7xl mx-auto px-6 pt-12 space-y-12">
        
        {/* Navigation */}
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/60 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Library</span>
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative group">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/10 flex-shrink-0 bg-white/5 backdrop-blur-xl">
            {song.imageUrl ? (
              <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Music className="h-12 w-12 text-white/20" /></div>
            )}
          </motion.div>
          <div className="space-y-4 pt-4 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white/90 drop-shadow-md">{song.title}</h1>
              <button onClick={openEditSong} className="p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xl text-white/50 font-medium tracking-wide">Added to vault</p>
          </div>
        </div>

        <hr className="border-white/10" />

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          
          {/* Left Column: Recordings List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-medium flex items-center gap-3 text-white/90"><Mic2 className="h-6 w-6 text-white/50" /> Recordings</h2>
              <span className="text-sm text-white/60 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">{recordings.length} versions</span>
            </div>

            <div className="space-y-4">
              {recordings.map((recording, index) => (
                <motion.div key={recording._id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-2xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/[0.06] transition-colors">
                  
                  {/* Top Right Badges & Actions */}
                  <div className="absolute top-5 right-5 flex items-center gap-3">
                    {recording.isFinalVersion && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-yellow-200 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full backdrop-blur-md">
                        <Star className="h-3 w-3 fill-yellow-200" /> Final
                      </div>
                    )}
                    <button onClick={() => openEditRecord(recording)} className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {/* New Delete Button */}
                    <button onClick={() => handleDeleteRecording(recording._id)} className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-5 pr-20">
                    <h3 className="text-xl font-medium text-white/90">{recording.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-white/50 mt-2">
                      {recording.singer && <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">👤 {recording.singer}</span>}
                      {recording.key && <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">🎵 Key: {recording.key}</span>}
                    </div>
                  </div>
                  
                  {recording.notes && <p className="text-sm text-white/70 mb-6 bg-black/20 border border-white/5 p-4 rounded-2xl leading-relaxed">{recording.notes}</p>}

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
              {formError && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">{formError}</div>}

              <form className="space-y-5" onSubmit={handleAddRecording}>
                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Title *</label>
                  <input type="text" value={recTitle} onChange={(e) => setRecTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="e.g., Sunday Service Live" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Singer/Band</label>
                    <input type="text" value={recSinger} onChange={(e) => setRecSinger(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Key</label>
                    <input type="text" value={recKey} onChange={(e) => setRecKey(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="e.g., G Major" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Notes</label>
                  <textarea rows="3" value={recNotes} onChange={(e) => setRecNotes(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Audio File *</label>
                  <label className="flex flex-col items-center justify-center border border-dashed border-white/20 hover:bg-white/5 transition-all rounded-2xl p-6 cursor-pointer bg-black/20">
                    <Upload className="h-6 w-6 text-white/40 mb-3" />
                    <span className="text-sm text-white/50">{recAudio ? recAudio.name : "Select MP3 or WAV"}</span>
                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => setRecAudio(e.target.files[0])} />
                  </label>
                </div>
                <div className="flex items-center gap-3 py-2 px-1">
                  <input type="checkbox" id="isFinal" checked={recIsFinal} onChange={(e) => setRecIsFinal(e.target.checked)} className="w-5 h-5 rounded-md border-white/20 bg-black/40 checked:bg-white" />
                  <label htmlFor="isFinal" className="text-sm text-white/70 cursor-pointer select-none">Mark as Final Version</label>
                </div>
                <button disabled={isSubmitting} type="submit" className={`w-full text-black font-medium py-3.5 rounded-2xl transition-all mt-4 ${isSubmitting ? 'bg-white/50' : 'bg-white hover:scale-[1.02]'}`}>
                  {isSubmitting ? 'Uploading...' : 'Upload Recording'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- EDIT SONG MODAL --- */}
      <AnimatePresence>
        {isEditSongOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditSongOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl">
              <button onClick={() => setIsEditSongOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-2xl font-medium mb-6 text-white/90">Edit Song</h3>
              <form onSubmit={handleEditSongSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-white/50 mb-2">Title</label>
                  <input type="text" value={editSongData.title} onChange={(e) => setEditSongData({...editSongData, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" required />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-2">Composer (Optional)</label>
                  <input type="text" value={editSongData.composer} onChange={(e) => setEditSongData({...editSongData, composer: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-2">Update Cover Image</label>
                  <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 hover:bg-white/5 transition-all rounded-xl py-4 cursor-pointer bg-black/20 text-white/50 hover:text-white/80">
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-sm">{editSongData.image ? editSongData.image.name : "Select new image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setEditSongData({...editSongData, image: e.target.files[0]})} />
                  </label>
                </div>
                <button disabled={isSavingSong} type="submit" className="w-full bg-white text-black font-medium py-3 rounded-xl mt-4 hover:scale-[1.02] flex justify-center items-center gap-2">
                  <Save className="w-4 h-4" /> {isSavingSong ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT RECORDING MODAL --- */}
      <AnimatePresence>
        {editingRecordId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingRecordId(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setEditingRecordId(null)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-2xl font-medium mb-6 text-white/90">Edit Recording</h3>
              <form onSubmit={handleEditRecordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-white/50 mb-2">Title</label>
                  <input type="text" value={editRecData.title} onChange={(e) => setEditRecData({...editRecData, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/50 mb-2">Singer</label>
                    <input type="text" value={editRecData.singer} onChange={(e) => setEditRecData({...editRecData, singer: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/50 mb-2">Key</label>
                    <input type="text" value={editRecData.key} onChange={(e) => setEditRecData({...editRecData, key: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-2">Notes</label>
                  <textarea rows="3" value={editRecData.notes} onChange={(e) => setEditRecData({...editRecData, notes: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-2">Replace Audio (Optional)</label>
                  <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 hover:bg-white/5 transition-all rounded-xl py-4 cursor-pointer bg-black/20 text-white/50 hover:text-white/80">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm truncate px-4">{editRecData.audio ? editRecData.audio.name : "Select new audio file"}</span>
                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => setEditRecData({...editRecData, audio: e.target.files[0]})} />
                  </label>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <input type="checkbox" id="editIsFinal" checked={editRecData.isFinalVersion} onChange={(e) => setEditRecData({...editRecData, isFinalVersion: e.target.checked})} className="w-5 h-5 rounded-md border-white/20 bg-black/40 checked:bg-white" />
                  <label htmlFor="editIsFinal" className="text-sm text-white/70 cursor-pointer">Mark as Final Version</label>
                </div>
                <button disabled={isSavingRecord} type="submit" className="w-full bg-white text-black font-medium py-3 rounded-xl mt-4 hover:scale-[1.02] flex justify-center items-center gap-2">
                  <Save className="w-4 h-4" /> {isSavingRecord ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}