import HttpClient from "@/app/utils/httpClient";
import { HomeClient } from "./homeClient";
import type { Album, ArtistDetail, Track } from "@/app/types";

export default async function Home() {
  let tracks: Track[] = [];
  const albums: Record<number, Album> = {};
  const artists: Record<number, ArtistDetail> = {};
  const artistTracks: Record<number, Track[]> = {};

  try {
    const response = await HttpClient.get("/chart/0/tracks?limit=20");
    tracks = response.data.data || [];

    const featuredTracks = tracks
      .filter((track, index, items) => items.findIndex((item) => item.album.id === track.album.id) === index)
      .slice(0, 6);

    await Promise.all(featuredTracks.map(async (track) => {
      const [albumResponse, artistResponse, topResponse] = await Promise.all([
        HttpClient.get(`/album/${track.album.id}`),
        HttpClient.get(`/artist/${track.artist.id}`),
        HttpClient.get(`/artist/${track.artist.id}/top?limit=12`),
      ]);
      albums[track.album.id] = albumResponse.data;
      artists[track.artist.id] = artistResponse.data;
      artistTracks[track.artist.id] = topResponse.data.data || [];
    }));
  } catch (error) {
    console.error("No fue posible cargar los hits de Deezer", error);
  }

  return <HomeClient tracks={tracks} albums={albums} artists={artists} artistTracks={artistTracks} />;
}
