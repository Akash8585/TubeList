
import { useState } from 'react'
import GoogleAuth from './components/GoogleAuth'
import './App.css'

function App() {
  const [playlists, setPlaylists] = useState([]);

  const handleAuthSuccess = (userPlaylists) => {
    setPlaylists(userPlaylists);
  };

  return (
    <div className="app-container">
      <div className="header">
        Share your YouTube playlists
      </div>
      <GoogleAuth onAuthSuccess={handleAuthSuccess} />
    </div>
  )
}

export default App