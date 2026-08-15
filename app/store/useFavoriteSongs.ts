import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/app/types";

export type Playlist = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  tracks: Track[];
};

type MusicStore = {
  favoriteTracks: Track[];
  playlists: Playlist[];
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  toggleFavorite: (track: Track) => void;
  createPlaylist: (name: string, description?: string) => string;
  updatePlaylist: (playlistId: string, name: string, description?: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: number) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
};

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      favoriteTracks: [],
      playlists: [],
      currentTrack: null,
      queue: [],
      isPlaying: false,
      toggleFavorite: (track) =>
        set((state) => ({
          favoriteTracks: state.favoriteTracks.some((item) => item.id === track.id)
            ? state.favoriteTracks.filter((item) => item.id !== track.id)
            : [...state.favoriteTracks, track],
        })),
      createPlaylist: (name, description = "") => {
        const id = crypto.randomUUID();
        set((state) => ({
          playlists: [...state.playlists, { id, name: name.trim(), description: description.trim(), createdAt: new Date().toISOString(), tracks: [] }],
        }));
        return id;
      },
      updatePlaylist: (playlistId, name, description = "") => set((state) => ({
        playlists: state.playlists.map((playlist) => playlist.id === playlistId ? { ...playlist, name: name.trim(), description: description.trim() } : playlist),
      })),
      deletePlaylist: (playlistId) => set((state) => ({ playlists: state.playlists.filter((playlist) => playlist.id !== playlistId) })),
      addTrackToPlaylist: (playlistId, track) => set((state) => ({
        playlists: state.playlists.map((playlist) =>
          playlist.id === playlistId && !playlist.tracks.some((item) => item.id === track.id)
            ? { ...playlist, tracks: [...playlist.tracks, track] }
            : playlist,
        ),
      })),
      removeTrackFromPlaylist: (playlistId, trackId) => set((state) => ({
        playlists: state.playlists.map((playlist) =>
          playlist.id === playlistId
            ? { ...playlist, tracks: playlist.tracks.filter((track) => track.id !== trackId) }
            : playlist,
        ),
      })),
      playTrack: (track, queue) =>
        set({ currentTrack: track, queue: queue ?? get().queue, isPlaying: true }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      playNext: () => {
        const { currentTrack, queue } = get();
        if (!currentTrack || !queue.length) return;
        const index = queue.findIndex((track) => track.id === currentTrack.id);
        set({ currentTrack: queue[(index + 1) % queue.length], isPlaying: true });
      },
      playPrevious: () => {
        const { currentTrack, queue } = get();
        if (!currentTrack || !queue.length) return;
        const index = queue.findIndex((track) => track.id === currentTrack.id);
        set({ currentTrack: queue[(index - 1 + queue.length) % queue.length], isPlaying: true });
      },
    }),
    {
      name: "turolita-library",
      partialize: (state) => ({ favoriteTracks: state.favoriteTracks, playlists: state.playlists }),
      skipHydration: true,
    },
  ),
);

// Alias temporal para no romper imports previos del proyecto.
export const useFavoriteSongs = useMusicStore;
