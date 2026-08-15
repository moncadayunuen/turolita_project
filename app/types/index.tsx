export type Artist = {
  id: number;
  name: string;
  picture?: string;
  picture_medium?: string;
  picture_big?: string;
  nb_fan?: number;
  nb_album?: number;
  type?: string;
};

export type Album = {
  id: number;
  title: string;
  cover?: string;
  cover_medium?: string;
  cover_big?: string;
  release_date?: string;
  duration?: number;
  fans?: number;
  artist?: Artist;
  tracks?: { data: Track[] };
  type?: string;
};

export type Track = {
  album: Album;
  artist: Artist;
  duration: number;
  id: number;
  preview: string;
  title: string;
  title_short?: string;
  rank?: number;
  explicit_lyrics?: boolean;
  type?: string;
};

export type ArtistDetail = Artist & {
  radio?: boolean;
};
