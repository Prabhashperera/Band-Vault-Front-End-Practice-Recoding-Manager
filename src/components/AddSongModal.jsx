import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ImagePlus } from 'lucide-react';

export default function AddSongModal({ isOpen, onClose, onSongAdded }) {
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setTitle('');
    setComposer('');
    setImage(null);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    if (composer) formData.append('composer', composer);
    if (image) formData.append('image', image);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/save-song`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save song');

      onSongAdded(); 
      handleClose(); 
    } catch (err) {
      setError("Failed to add song. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4">
          
          {/* Background Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={handleClose} 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
          />
          
          {/* Bottom Sheet for Mobile / Rounded Rect for Desktop */}
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-[#111] sm:border sm:border-white/10 w-full sm:max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 sm:p-8 relative z-10 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] sm:shadow-2xl max-h-[90vh] overflow-y-auto pb-10 sm:pb-8"
          >
            {/* Small drag handle indicator for mobile */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 sm:hidden"></div>

            <button onClick={handleClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-medium mb-6 text-white/90">Add New Song</h3>
            
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Song Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" 
                  placeholder="e.g., Amazing Grace"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Composer (Optional)</label>
                <input 
                  type="text" 
                  value={composer} 
                  onChange={(e) => setComposer(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors" 
                  placeholder="e.g., John Newton"
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-white/50 mb-1.5 pl-1">Cover Image (Optional)</label>
                <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all rounded-2xl py-5 cursor-pointer bg-black/20 text-white/50 hover:text-white/80 group">
                  <ImagePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm truncate px-2">{image ? image.name : "Select an image file"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
                </label>
              </div>
              
              <button 
                disabled={isSubmitting} 
                type="submit" 
                className={`w-full text-black font-medium py-4 rounded-2xl mt-4 flex justify-center items-center gap-2 transition-all ${isSubmitting ? 'bg-white/50 cursor-not-allowed' : 'bg-white active:scale-[0.98]'}`}
              >
                {isSubmitting ? 'Saving to Vault...' : <><Save className="w-5 h-5" /> Add to Vault</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}