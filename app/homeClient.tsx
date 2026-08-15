"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiChevronRight,
  FiCompass,
  FiEdit3,
  FiHeart,
  FiHome,
  FiList,
  FiMoreHorizontal,
  FiPause,
  FiPlay,
  FiRepeat,
  FiSearch,
  FiShuffle,
  FiSkipBack,
  FiSkipForward,
  FiTrash2,
  FiVolume2,
  FiX,
} from "react-icons/fi";
import type { Album, ArtistDetail, Track } from "@/app/types";
import { useMusicStore } from "@/app/store/useFavoriteSongs";

type Detail =
  | { type: "album"; item: Album }
  | { type: "artist"; item: ArtistDetail; tracks: Track[] }
  | null;

const formatTime = (seconds = 0) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const compact = (value = 0) =>
  new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 }).format(value);

type DeezerPreviewResponse = { preview?: string };

const getFreshPreview = (trackId: number) => new Promise<string>((resolve, reject) => {
  const callbackName = `turolitaPreview_${trackId}_${Date.now()}`;
  const script = document.createElement("script");
  const timeout = window.setTimeout(() => finish(new Error("Deezer tardó demasiado en responder")), 10000);
  const callbacks = window as unknown as Record<string, ((data: DeezerPreviewResponse) => void) | undefined>;

  const cleanup = () => {
    window.clearTimeout(timeout);
    script.remove();
    delete callbacks[callbackName];
  };

  const finish = (error?: Error, preview?: string) => {
    cleanup();
    if (error || !preview) reject(error || new Error("Esta canción no tiene muestra disponible"));
    else resolve(preview);
  };

  callbacks[callbackName] = (data) => finish(undefined, data.preview);
  script.onerror = () => finish(new Error("No fue posible conectar con Deezer"));
  script.src = `https://api.deezer.com/track/${trackId}?output=jsonp&callback=${callbackName}`;
  document.head.appendChild(script);
});

function WaveMark() {
  return (
    <span className="wave-mark" aria-hidden="true">
      {[10, 18, 28, 22, 14].map((height, index) => (
        <i key={index} style={{ height }} />
      ))}
    </span>
  );
}

function TrackRow({ track, index, queue, playlistId }: { track: Track; index: number; queue: Track[]; playlistId?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentTrack, isPlaying, favoriteTracks, playlists, playTrack, toggleFavorite, addTrackToPlaylist, removeTrackFromPlaylist } = useMusicStore();
  const active = currentTrack?.id === track.id;
  const isFavorite = favoriteTracks.some((item) => item.id === track.id);

  return (
    <div className={`track-row ${active ? "is-active" : ""}`}>
      <button className="track-index" onClick={() => playTrack(track, queue)} aria-label={`Reproducir ${track.title}`}>
        <span>{active && isPlaying ? <WaveMark /> : String(index + 1).padStart(2, "0")}</span>
        <FiPlay className="row-play" />
      </button>
      <button className="track-main" onClick={() => playTrack(track, queue)}>
        <img src={track.album?.cover_medium} alt="" />
        <span>
          <strong>{track.title_short || track.title}</strong>
          <small>{track.artist?.name}</small>
        </span>
      </button>
      <span className="track-album">{track.album?.title}</span>
      <button
        className={`icon-button heart ${isFavorite ? "selected" : ""}`}
        onClick={() => toggleFavorite(track)}
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <FiHeart />
      </button>
      <span className="track-time">{formatTime(track.duration)}</span>
      <div className="track-menu-wrap">
        <button className="icon-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Más opciones"><FiMoreHorizontal /></button>
        {menuOpen && (
          <div className="track-menu">
            <strong>{playlistId ? "Opciones" : "Agregar a playlist"}</strong>
            {playlistId ? (
              <button onClick={() => { removeTrackFromPlaylist(playlistId, track.id); setMenuOpen(false); }}><FiTrash2 /> Quitar de esta playlist</button>
            ) : playlists.length ? playlists.map((playlist) => {
              const added = playlist.tracks.some((item) => item.id === track.id);
              return <button key={playlist.id} disabled={added} onClick={() => { addTrackToPlaylist(playlist.id, track); setMenuOpen(false); }}><FiList /> {playlist.name}{added && <small>Agregada</small>}</button>;
            }) : <span>Aún no tienes playlists.</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [previewState, setPreviewState] = useState({ trackId: 0, source: "", error: "" });
  const { currentTrack, isPlaying, favoriteTracks, toggleFavorite, togglePlay, playNext, playPrevious } = useMusicStore();
  const isFavorite = favoriteTracks.some((track) => track.id === currentTrack?.id);
  const audioSource = previewState.trackId === currentTrack?.id ? previewState.source : "";
  const audioError = previewState.trackId === currentTrack?.id ? previewState.error : "";

  useEffect(() => {
    if (!currentTrack) return;
    let cancelled = false;

    getFreshPreview(currentTrack.id)
      .then((preview) => {
        if (!cancelled) {
          setPreviewState({ trackId: currentTrack.id, source: preview, error: "" });
          setProgress(0);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setPreviewState({ trackId: currentTrack.id, source: "", error: error.message });
      });

    return () => { cancelled = true; };
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSource) return;
    if (isPlaying) audio.play().catch(() => undefined);
    else audio.pause();
  }, [isPlaying, audioSource]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  if (!currentTrack) return null;

  return (
    <div className="player-shell">
      <audio
        ref={audioRef}
        src={audioSource}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onEnded={playNext}
      />
      <div className="now-playing">
        <img src={currentTrack.album.cover_medium} alt="" />
        <span><strong>{currentTrack.title_short || currentTrack.title}</strong><small>{audioError || currentTrack.artist.name}</small></span>
        <button className={`icon-button heart ${isFavorite ? "selected" : ""}`} onClick={() => toggleFavorite(currentTrack)} aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}><FiHeart /></button>
      </div>
      <div className="player-center">
        <div className="player-controls">
          <button aria-label="Aleatorio"><FiShuffle /></button>
          <button onClick={playPrevious} aria-label="Anterior"><FiSkipBack /></button>
          <button className="main-play" onClick={togglePlay} aria-label={isPlaying ? "Pausar" : "Reproducir"}>
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          <button onClick={playNext} aria-label="Siguiente"><FiSkipForward /></button>
          <button aria-label="Repetir"><FiRepeat /></button>
        </div>
        <div className="progress-line">
          <span>{formatTime(Math.floor(progress))}</span>
          <input
            type="range"
            min="0"
            max="30"
            value={progress}
            onChange={(event) => {
              const value = Number(event.target.value);
              setProgress(value);
              if (audioRef.current) audioRef.current.currentTime = value;
            }}
            aria-label="Progreso"
          />
          <span>0:30</span>
        </div>
      </div>
      <div className="volume-control"><FiList /><FiVolume2 /><input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volumen" /></div>
    </div>
  );
}

type HomeClientProps = {
  tracks: Track[];
  albums: Record<number, Album>;
  artists: Record<number, ArtistDetail>;
  artistTracks: Record<number, Track[]>;
};

export const HomeClient = ({ tracks, albums, artists, artistTracks }: HomeClientProps) => {
  const [view, setView] = useState<"home" | "library" | "playlist">("home");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Detail>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleFavorite, favoriteTracks, playlists, createPlaylist, updatePlaylist, deletePlaylist } = useMusicStore();
  const selectedPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId);
  const visibleTracks = useMemo(
    () => tracks.filter((track) => `${track.title} ${track.artist.name} ${track.album.title}`.toLowerCase().includes(query.toLowerCase())),
    [query, tracks],
  );
  const featured = tracks[0];
  const featuredIsPlaying = Boolean(featured && currentTrack?.id === featured.id && isPlaying);
  const cards = tracks.filter((track, index, items) => items.findIndex((item) => item.album.id === track.album.id) === index).slice(0, 6);

  useEffect(() => {
    void useMusicStore.persist.rehydrate();
  }, []);

  const openAlbum = (album: Album) => {
    setDetail({ type: "album", item: albums[album.id] || album });
  };

  const openArtist = (track: Track) => {
    setDetail({ type: "artist", item: artists[track.artist.id] || track.artist, tracks: artistTracks[track.artist.id] || [track] });
  };

  const detailTracks = detail?.type === "album" ? detail.item.tracks?.data || [] : detail?.type === "artist" ? detail.tracks : [];
  const normalizedDetailTracks = detailTracks.map((track) => ({ ...track, album: track.album || (detail?.type === "album" ? detail.item : track.album) }));
  const heroTrack = normalizedDetailTracks.find((track) => track.id === currentTrack?.id) || normalizedDetailTracks[0];
  const heroTrackIsFavorite = Boolean(heroTrack && favoriteTracks.some((track) => track.id === heroTrack.id));
  const heroTrackIsPlaying = Boolean(heroTrack && currentTrack?.id === heroTrack.id && isPlaying);
  const handleHeroPlayback = () => {
    if (!heroTrack) return;
    if (currentTrack?.id === heroTrack.id) togglePlay();
    else playTrack(heroTrack, normalizedDetailTracks);
  };
  const handleFeaturedPlayback = () => {
    if (!featured) return;
    if (currentTrack?.id === featured.id) togglePlay();
    else playTrack(featured, tracks);
  };
  const openHome = () => { setDetail(null); setView("home"); };
  const openLibrary = () => { setDetail(null); setView("library"); setQuery(""); };
  const openPlaylist = (id: string) => { setDetail(null); setSelectedPlaylistId(id); setView("playlist"); setQuery(""); };
  const submitPlaylist = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!playlistName.trim()) return;
    if (editingPlaylistId) {
      updatePlaylist(editingPlaylistId, playlistName, playlistDescription);
      setEditingPlaylistId(null);
      setPlaylistName("");
      setPlaylistDescription("");
      setCreateOpen(false);
      return;
    }
    const id = createPlaylist(playlistName, playlistDescription);
    setPlaylistName("");
    setPlaylistDescription("");
    setCreateOpen(false);
    openPlaylist(id);
  };
  const openCreatePlaylist = () => { setEditingPlaylistId(null); setPlaylistName(""); setPlaylistDescription(""); setCreateOpen(true); };
  const openEditPlaylist = () => {
    if (!selectedPlaylist) return;
    setEditingPlaylistId(selectedPlaylist.id);
    setPlaylistName(selectedPlaylist.name);
    setPlaylistDescription(selectedPlaylist.description);
    setCreateOpen(true);
  };
  const collectionIsPlaying = (collection: Track[]) => Boolean(isPlaying && currentTrack && collection.some((track) => track.id === currentTrack.id));
  const toggleCollectionPlayback = (collection: Track[]) => {
    if (!collection.length) return;
    if (currentTrack && collection.some((track) => track.id === currentTrack.id)) togglePlay();
    else playTrack(collection[0], collection);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (createOpen) {
        setCreateOpen(false);
        setEditingPlaylistId(null);
        return;
      }

      if (detail) {
        setDetail(null);
        setView("home");
        return;
      }

      if (view === "playlist") {
        setView("library");
        setQuery("");
        return;
      }

      if (view === "library") {
        setView("home");
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [createOpen, detail, view]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={openHome}><WaveMark /><span>turolita</span></button>
        <nav>
          <button className={!detail && view === "home" ? "active" : ""} onClick={openHome}><FiHome />Inicio</button>
          <button><FiCompass />Explorar</button>
          <button className={view === "library" || view === "playlist" ? "active" : ""} onClick={openLibrary}><FiList />Tu biblioteca</button>
        </nav>
        <div className="sidebar-label">Tus playlists</div>
        <button className="playlist-add" onClick={openCreatePlaylist}><span>+</span> Nueva playlist</button>
        <div className="sidebar-playlists">
          <button onClick={openLibrary}><FiHeart /> Favoritas</button>
          {playlists.map((playlist) => <button className={selectedPlaylistId === playlist.id && view === "playlist" ? "active" : ""} key={playlist.id} onClick={() => openPlaylist(playlist.id)}><FiList /> <span>{playlist.name}</span><small>{playlist.tracks.length}</small></button>)}
        </div>
        <div className="sidebar-profile"><span className="avatar">YM</span><span><strong>Yunuen</strong><small>Perfil</small></span><FiChevronRight /></div>
      </aside>

      <main className="content">
        <header className="topbar">
          <button className="mobile-brand brand" onClick={openHome}><WaveMark /><span>turolita</span></button>
          {detail && <button className="back-button" onClick={openHome}><FiArrowLeft /> Volver</button>}
          <label className="search"><FiSearch /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={view === "library" || view === "playlist" ? "Buscar en tu colección" : "Busca canciones, artistas o álbumes"} /></label>
          <button className="profile-pill"><span className="avatar">YM</span><span>Yunuen</span></button>
        </header>

        {detail ? (
          <section className="detail-view">
            <div className={`detail-hero ${detail.type}`}>
              <img src={detail.type === "album" ? detail.item.cover_big : detail.item.picture_big} alt="" />
              <div>
                <span className="eyebrow">{detail.type === "album" ? "Álbum" : "Artista"}</span>
                <h1>{detail.type === "album" ? detail.item.title : detail.item.name}</h1>
                <p>
                  {detail.type === "album"
                    ? `${detail.item.artist?.name} · ${detail.item.release_date?.slice(0, 4)} · ${detailTracks.length} canciones`
                    : `${compact(detail.item.nb_fan)} fans · ${detail.item.nb_album || 0} álbumes`}
                </p>
                <div className="hero-actions">
                  <button className="primary-action" onClick={handleHeroPlayback} disabled={!heroTrack} aria-label={heroTrackIsPlaying ? `Pausar ${heroTrack?.title}` : `Reproducir ${heroTrack?.title}`}>
                    {heroTrackIsPlaying ? <FiPause /> : <FiPlay />} {heroTrackIsPlaying ? "Pausar" : "Reproducir"}
                  </button>
                  <button
                    className={`round-action hero-heart ${heroTrackIsFavorite ? "selected" : ""}`}
                    onClick={() => heroTrack && toggleFavorite(heroTrack)}
                    disabled={!heroTrack}
                    aria-label={heroTrackIsFavorite ? `Quitar ${heroTrack?.title} de favoritos` : `Agregar ${heroTrack?.title} a favoritos`}
                  ><FiHeart /></button><button className="round-action"><FiMoreHorizontal /></button>
                </div>
              </div>
            </div>
            <div className="section-head"><div><span className="eyebrow">{detail.type === "album" ? "Tracklist" : "Lo más escuchado"}</span><h2>{detail.type === "album" ? "Todas las canciones" : `Hits de ${detail.item.name}`}</h2></div><span>{detailTracks.length} canciones</span></div>
            <div className="track-list detail-list">
              {normalizedDetailTracks.map((track, index) => <TrackRow key={track.id} track={track} index={index} queue={normalizedDetailTracks} />)}
            </div>
          </section>
        ) : view === "playlist" && selectedPlaylist ? (
          <section className="library-view">
            <div className="library-hero playlist-hero">
              <div className="library-icon playlist-icon"><FiList /></div>
              <div><span className="eyebrow">Playlist</span><h1>{selectedPlaylist.name}</h1><p>{selectedPlaylist.description || "Tu selección personal"} · {selectedPlaylist.tracks.length} {selectedPlaylist.tracks.length === 1 ? "canción" : "canciones"}</p></div>
            </div>
            <div className="section-head library-heading">
              <div><span className="eyebrow">Tu selección</span><h2>Canciones de la playlist</h2></div>
              <div className="playlist-actions">
                {selectedPlaylist.tracks.length > 0 && (
                  <button className="primary-action" onClick={() => toggleCollectionPlayback(selectedPlaylist.tracks)} aria-label={collectionIsPlaying(selectedPlaylist.tracks) ? `Pausar ${selectedPlaylist.name}` : `Reproducir ${selectedPlaylist.name}`}>
                    {collectionIsPlaying(selectedPlaylist.tracks) ? <FiPause /> : <FiPlay />} {collectionIsPlaying(selectedPlaylist.tracks) ? "Pausar" : "Reproducir todo"}
                  </button>
                )}
                <button className="delete-playlist" onClick={openEditPlaylist} aria-label="Editar playlist"><FiEdit3 /></button>
                <button className="delete-playlist" onClick={() => { deletePlaylist(selectedPlaylist.id); openLibrary(); }} aria-label="Eliminar playlist"><FiTrash2 /></button>
              </div>
            </div>
            {selectedPlaylist.tracks.length ? (
              <div className="track-list detail-list">
                {selectedPlaylist.tracks.filter((track) => `${track.title} ${track.artist.name}`.toLowerCase().includes(query.toLowerCase())).map((track, index) => <TrackRow key={track.id} track={track} index={index} queue={selectedPlaylist.tracks} playlistId={selectedPlaylist.id} />)}
              </div>
            ) : (
              <div className="library-empty"><div><FiList /></div><h2>Esta playlist está vacía</h2><p>Abre el menú de tres puntos de una canción y selecciona “{selectedPlaylist.name}”.</p><button className="primary-action" onClick={openHome}>Buscar canciones</button></div>
            )}
          </section>
        ) : view === "library" ? (
          <section className="library-view">
            <div className="library-hero">
              <div className="library-icon"><FiHeart /></div>
              <div><span className="eyebrow">Tu colección</span><h1>Canciones favoritas</h1><p>{favoriteTracks.length} {favoriteTracks.length === 1 ? "canción guardada" : "canciones guardadas"} en este dispositivo</p></div>
            </div>
            <div className="section-head library-heading">
              <div><span className="eyebrow">Biblioteca personal</span><h2>Todo lo que te gusta</h2></div>
              {favoriteTracks.length > 0 && (
                <button className="primary-action" onClick={() => toggleCollectionPlayback(favoriteTracks)} aria-label={collectionIsPlaying(favoriteTracks) ? "Pausar favoritas" : "Reproducir favoritas"}>
                  {collectionIsPlaying(favoriteTracks) ? <FiPause /> : <FiPlay />} {collectionIsPlaying(favoriteTracks) ? "Pausar" : "Reproducir todo"}
                </button>
              )}
            </div>
            {favoriteTracks.length > 0 ? (
              <div className="track-list detail-list">
                {favoriteTracks
                  .filter((track) => `${track.title} ${track.artist.name} ${track.album.title}`.toLowerCase().includes(query.toLowerCase()))
                  .map((track, index) => <TrackRow key={track.id} track={track} index={index} queue={favoriteTracks} />)}
              </div>
            ) : (
              <div className="library-empty"><div><FiHeart /></div><h2>Tu biblioteca está esperando</h2><p>Marca el corazón de cualquier canción y aparecerá aquí, incluso cuando vuelvas después.</p><button className="primary-action" onClick={openHome}>Descubrir canciones</button></div>
            )}
            <div className="playlist-library-section">
              <div className="section-head"><div><span className="eyebrow">Hechas por ti</span><h2>Tus playlists</h2></div><button onClick={openCreatePlaylist}>Nueva playlist <span>+</span></button></div>
              <div className="playlist-grid">
                {playlists.map((playlist) => <button key={playlist.id} onClick={() => openPlaylist(playlist.id)}><span className="playlist-cover"><FiList /></span><strong>{playlist.name}</strong><small>{playlist.tracks.length} canciones</small></button>)}
                <button className="new-playlist-card" onClick={openCreatePlaylist}><span className="playlist-cover">+</span><strong>Nueva playlist</strong><small>Crea tu selección</small></button>
              </div>
            </div>
          </section>
        ) : (
          <>
            {featured && (
              <section className="hero">
                <img src={featured.album.cover_big || featured.album.cover_medium} alt="" className="hero-art" />
                <div className="hero-overlay" />
                <div className="hero-copy"><span className="eyebrow">#1 en México</span><h1>El hit que todo<br />el mundo trae.</h1><p>{featured.title} · {featured.artist.name}</p><div className="hero-actions"><button className="primary-action" onClick={handleFeaturedPlayback} aria-label={featuredIsPlaying ? `Pausar ${featured.title}` : `Reproducir ${featured.title}`}>{featuredIsPlaying ? <FiPause /> : <FiPlay />} {featuredIsPlaying ? "Pausar" : "Reproducir"}</button><button className="secondary-action" onClick={() => openAlbum(featured.album)}>Ver álbum</button></div></div>
              </section>
            )}

            <section className="section-block">
              <div className="section-head"><div><span className="eyebrow">Selección para ti</span><h2>Álbumes que están sonando</h2></div><button>Ver todo <FiChevronRight /></button></div>
              <div className="album-grid">
                {cards.map((track) => (
                  <article className="album-card" key={track.album.id}>
                    <button className="cover-button" onClick={() => openAlbum(track.album)}><img src={track.album.cover_medium} alt={`Portada de ${track.album.title}`} /><span className="card-play"><FiPlay /></span></button>
                    <button className="album-title" onClick={() => openAlbum(track.album)}>{track.album.title}</button>
                    <button className="artist-link" onClick={() => openArtist(track)}>{track.artist.name}</button>
                  </article>
                ))}
              </div>
            </section>

            <section className="section-block hits-section">
              <div className="section-head"><div><span className="eyebrow">Ranking diario</span><h2>Hits del momento</h2></div><span className="live-dot">Actualizado hoy</span></div>
              {visibleTracks.length ? <div className="track-list">{visibleTracks.slice(0, 10).map((track, index) => <TrackRow key={track.id} track={track} index={index} queue={visibleTracks} />)}</div> : <div className="empty-state">No encontramos canciones para “{query}”.</div>}
            </section>
          </>
        )}
      </main>
      <Player />
      {createOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setCreateOpen(false)}>
          <form className="playlist-modal" onSubmit={submitPlaylist} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head"><div><span className="eyebrow">Tu música</span><h2>{editingPlaylistId ? "Editar playlist" : "Nueva playlist"}</h2></div><button type="button" onClick={() => setCreateOpen(false)} aria-label="Cerrar"><FiX /></button></div>
            <label>Nombre<input autoFocus maxLength={40} value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="Ej. Viaje de noche" /></label>
            <label>Descripción <span>Opcional</span><textarea maxLength={120} value={playlistDescription} onChange={(event) => setPlaylistDescription(event.target.value)} placeholder="¿Qué vibra tiene esta playlist?" /></label>
            <div className="modal-actions"><button type="button" className="secondary-action" onClick={() => setCreateOpen(false)}>Cancelar</button><button className="primary-action" disabled={!playlistName.trim()}>{editingPlaylistId ? "Guardar cambios" : "Crear playlist"}</button></div>
          </form>
        </div>
      )}
      <nav className="mobile-nav"><button className={view === "home" ? "active" : ""} onClick={openHome}><FiHome /><span>Inicio</span></button><button><FiCompass /><span>Explorar</span></button><button><FiSearch /><span>Buscar</span></button><button className={view === "library" || view === "playlist" ? "active" : ""} onClick={openLibrary}><FiList /><span>Biblioteca</span></button></nav>
    </div>
  );
};
