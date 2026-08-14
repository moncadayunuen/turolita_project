"use client"

import {useEffect} from "react";

interface PropsHomeClient {
    tracks: Array<Track>,
}

export const HomeClient = ({tracks} : PropsHomeClient) => {

    useEffect(() => {
        tracks.map((item: Track) => {
            return console.log(item);
        })
    }, [tracks]);

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Top Canciones Deezer</h1>
            <ul className="space-y-2">
                {tracks.map((item: Track) => (
                    <li
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm"
                    >
                        {item.album?.cover_medium && (
                            <img
                                src={item.album.cover_medium}
                                alt={item.title}
                                className="w-12 h-12 rounded-md object-cover"
                            />
                        )}
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm truncate">{item.title}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                {item.artist?.name}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}