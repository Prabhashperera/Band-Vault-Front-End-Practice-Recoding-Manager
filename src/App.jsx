import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SongList from './components/SongList';
import SongDetails from './components/SongDetails';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<SongList />} />
            <Route path="/song/:id" element={<SongDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}