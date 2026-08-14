type Artist = {
    id: number,
    name: string,
    picture_medium: string,
    type: string,

}

type Album = {
    id: number,
    title: string,
    cover_medium: string,
    type: string,
}

type Track = {
    album: Album,
    artist: Artist,
    duration: number,
    id: number,
    preview: string,
    title: string,
    type: string,
}