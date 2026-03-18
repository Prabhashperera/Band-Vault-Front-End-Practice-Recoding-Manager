import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Music } from 'lucide-react';

export default function AddSongModal({ isOpen, onClose, onSongAdded }) {
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !imageFile) {
      setError('Please provide a title and a cover image.');
      return;
    }

    setIsSubmitting(true);

    // Because we are sending a file, we MUST use FormData
    const formData = new FormData();
    formData.append('title', title);
    if (composer) formData.append('composer', composer);
    
    // The key "image" must match exactly what upload.single("image") expects
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/save-song`, {
        method: 'POST',
        // Note: Do NOT set 'Content-Type' manually when using FormData. 
        // The browser sets it automatically with the correct boundary.
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save the song.');
      }

      // Success! Reset form and tell parent to refresh the list
      setTitle('');
      setComposer('');
      setImageFile(null);
      onSongAdded(); 
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Deep Blur Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white/[0.05] border border-white/10 rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-medium text-white/90 mb-6 tracking-tight flex items-center gap-2">
              <Music className="h-6 w-6 text-white/50" />
              Add to Vault
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Song Title *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-white/30 focus:border-white/30 focus:bg-white/5 focus:outline-none transition-all" 
                  placeholder="e.g., Amazing Grace" 
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Composer / Artist</label>
                <input 
                  type="text" 
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-white/30 focus:border-white/30 focus:bg-white/5 focus:outline-none transition-all" 
                  placeholder="Optional" 
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Cover Image *</label>
                <label className="flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all rounded-2xl p-6 text-center cursor-pointer group bg-black/20">
                  <Upload className="h-6 w-6 text-white/40 mb-2 group-hover:text-white/80 transition-colors" />
                  <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">
                    {imageFile ? imageFile.name : "Select Image (JPG/PNG)"}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                type="submit" 
                className={`w-full text-black font-medium py-3.5 rounded-2xl transition-all mt-2 ${isSubmitting ? 'bg-white/50 cursor-not-allowed' : 'bg-white hover:shadow-[0_4px_25px_rgba(255,255,255,0.3)] shadow-[0_4px_20px_rgba(255,255,255,0.2)]'}`}
              >
                {isSubmitting ? 'Uploading...' : 'Save Song'}
              </motion.button>
            </form>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}