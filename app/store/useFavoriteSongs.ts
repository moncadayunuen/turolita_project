import { create } from 'zustand'

interface ListItem {
    quantity: number
}

interface FavoriteSongs {
    list: ListItem[],
    addFavoriteSong: (song: any) => void,
}

export const useFavoriteSongs = create<FavoriteSongs>((set,get) => ({
    list: [],
    addFavoriteSong: (song: any) => {
        return true;
    }
}))