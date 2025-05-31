import React, { useState, useRef, useEffect } from 'react';

function msToMinSec(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

const shareSong = (song: any) => {
  const shareText = `¡Escuchá esta canción! 🎶\n${song.trackName} - ${song.artistName}\n${song.previewUrl}`;
  if (navigator.share) {
    navigator.share({
      title: `${song.trackName} - ${song.artistName}`,
      text: shareText,
      url: song.previewUrl,
    });
  } else {
    // Fallback: open quick links
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(song.previewUrl);
    const whatsapp = `https://wa.me/?text=${encodedText}`;
    const twitter = `https://twitter.com/intent/tweet?text=${encodedText}`;
    const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(whatsapp, '_blank');
    setTimeout(() => window.open(twitter, '_blank'), 500);
    setTimeout(() => window.open(facebook, '_blank'), 1000);
  }
};

const SongPlayer = ({ song, isActive, onPlay, onPause }: any) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // iTunes preview is 30s
  const [playing, setPlaying] = useState(false);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState('');

  // Buscar letra cuando se empieza a reproducir
  useEffect(() => {
    if (isActive && lyrics.length === 0 && !loadingLyrics && !lyricsError) {
      setLoadingLyrics(true);
      fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artistName)}/${encodeURIComponent(song.trackName)}`)
        .then(res => res.json())
        .then(data => {
          if (data.lyrics) {
            setLyrics(data.lyrics.split('\n').filter((l: string) => l.trim() !== ''));
          } else {
            setLyricsError('Letra no encontrada.');
          }
        })
        .catch(() => setLyricsError('Letra no encontrada.'))
        .finally(() => setLoadingLyrics(false));
    }
    if (!isActive) {
      setLyrics([]);
      setLyricsError('');
      setLoadingLyrics(false);
    }
  }, [isActive, song.artistName, song.trackName]);

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      setCurrentTime(0);
    }
  }, [isActive]);

  useEffect(() => {
    if (!playing && audioRef.current) {
      audioRef.current.pause();
    } else if (playing && audioRef.current) {
      audioRef.current.play();
    }
  }, [playing]);

  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false);
      onPause();
    } else {
      setPlaying(true);
      onPlay();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setCurrentTime(Number(e.target.value));
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      let newTime = audioRef.current.currentTime + seconds;
      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Calcular línea activa de la letra
  const activeLine = (() => {
    if (!lyrics.length) return -1;
    const secondsPerLine = duration / lyrics.length;
    return Math.floor(currentTime / secondsPerLine);
  })();

  return (
    <div className="d-flex flex-column align-items-center w-100">
      <audio
        ref={audioRef}
        src={song.previewUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
      />
      <div className="d-flex align-items-center gap-2 w-100 mb-1">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleSkip(-10)} title="Retroceder 10s">
          ⏪
        </button>
        <button className="btn btn-sm btn-primary" onClick={handlePlayPause} title={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? '⏸️' : '▶️'}
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleSkip(10)} title="Adelantar 10s">
          ⏩
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="flex-grow-1 mx-2"
          style={{ accentColor: '#0d6efd' }}
        />
        <span className="small text-secondary" style={{ minWidth: 50 }}>{msToMinSec(currentTime * 1000)} / {msToMinSec(duration * 1000)}</span>
      </div>
      {/* Letra sincronizada */}
      <div className="lyrics-box w-100 mt-2" style={{ minHeight: 60, maxHeight: 180, overflowY: 'auto' }}>
        {loadingLyrics && <div className="text-secondary small">Buscando letra...</div>}
        {lyricsError && <div className="text-danger small">{lyricsError}</div>}
        {!loadingLyrics && !lyricsError && lyrics.length > 0 && (
          <div className="lyrics-list">
            {lyrics.map((line, idx) => (
              <div
                key={idx}
                className={`lyric-line${idx === activeLine ? ' active' : ''}`}
                style={{ transition: 'background 0.2s, color 0.2s', padding: '0 0.5rem', borderRadius: 6 }}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const [vibe, setVibe] = useState('');
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const listRef = useRef<HTMLDivElement>(null);

  // Ajustar el alto máximo de la lista según el espacio disponible
  useEffect(() => {
    const handleResize = () => {
      if (listRef.current) {
        const rect = listRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const maxHeight = windowHeight - rect.top - 16;
        listRef.current.style.maxHeight = `${maxHeight}px`;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [songs]);

  const handleSearch = async () => {
    if (!vibe.trim()) return;
    setLoading(true);
    setError('');
    setSongs([]);
    setPlaying(null);
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(vibe)}&entity=song&limit=10`
      );
      const data = await response.json();
      setSongs(data.results || []);
    } catch (err) {
      setError('Hubo un error buscando canciones. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 vibrant-background d-flex flex-column align-items-center py-5">
      <div className="w-100" style={{ maxWidth: 700 }}>
        <div className="text-center mb-4">
          <h1 className="display-3 fw-bold mb-4">¿Qué vibe traes hoy?</h1>
          <input
            type="text"
            className="form-control form-control-lg shadow-sm mb-3"
            placeholder="Ej: Fluyendo, chill, motivado, modo rockstar..."
            style={{ maxWidth: '500px', margin: '0 auto' }}
            value={vibe}
            onChange={e => setVibe(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button
            className="btn btn-lg btn-light fw-bold shadow-sm mb-3"
            style={{ minWidth: '200px', letterSpacing: '1px' }}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Buscando...' : '¡Comparte tu vibe!'}
          </button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
        {songs.length > 0 && (
          <div
            ref={listRef}
            className="song-list-scroll w-100"
            style={{ maxWidth: 700, margin: '0 auto', overflowY: 'auto' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2 px-2">
              <h3 className="mb-0 text-dark bg-white bg-opacity-75 rounded p-2">Canciones para tu vibe:</h3>
              <div>
                <button
                  className={`btn btn-sm me-2 ${view === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                  title="Vista de lista"
                  onClick={() => setView('list')}
                >
                  <span role="img" aria-label="Lista">📝</span>
                </button>
                <button
                  className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                  title="Vista de cajas"
                  onClick={() => setView('grid')}
                >
                  <span role="img" aria-label="Cajas">🟦</span>
                </button>
              </div>
            </div>
            {view === 'list' ? (
              <div className="d-flex flex-column gap-3 align-items-center w-100">
                {songs.map(song => (
                  <div key={song.trackId} className="glass-card d-flex align-items-center w-100 flex-wrap">
                    <img src={song.artworkUrl100} alt={song.trackName} className="rounded me-3 mb-2 mb-md-0" style={{width: 80, height: 80, objectFit: 'cover'}} />
                    <div className="flex-grow-1 text-start">
                      <div className="fw-bold fs-5 text-dark">{song.trackName}</div>
                      <div className="text-muted">{song.artistName}</div>
                      <div className="small text-secondary">Duración: {msToMinSec(song.trackTimeMillis)}</div>
                      <SongPlayer
                        song={song}
                        isActive={playing === song.trackId}
                        onPlay={() => setPlaying(song.trackId)}
                        onPause={() => setPlaying(null)}
                      />
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      title="Compartir"
                      onClick={() => shareSong(song)}
                    >
                      <span role="img" aria-label="Compartir">🔗</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row g-3">
                {songs.map(song => (
                  <div key={song.trackId} className="col-12 col-sm-6">
                    <div className="glass-card d-flex flex-column align-items-center h-100">
                      <img src={song.artworkUrl100} alt={song.trackName} className="rounded mb-2" style={{width: 100, height: 100, objectFit: 'cover'}} />
                      <div className="fw-bold fs-6 text-dark text-center">{song.trackName}</div>
                      <div className="text-muted text-center">{song.artistName}</div>
                      <div className="small text-secondary text-center">Duración: {msToMinSec(song.trackTimeMillis)}</div>
                      <SongPlayer
                        song={song}
                        isActive={playing === song.trackId}
                        onPlay={() => setPlaying(song.trackId)}
                        onPause={() => setPlaying(null)}
                      />
                      <div className="d-flex justify-content-center gap-2 mt-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="Compartir"
                          onClick={() => shareSong(song)}
                        >
                          <span role="img" aria-label="Compartir">🔗</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 