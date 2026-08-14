import HttpClient from "@/app/utils/httpClient";
import {HomeClient} from "./homeClient";

export default async function Home() {
    let tracks = [];

    try {
        const response = await HttpClient.get("/chart/0/tracks");
        if(!response)
            return console.log("Error en la petición.");
        tracks = response.data.data || [];
    } catch(error) {
        console.log("Hubo un problema: ",error);
    }

    return (
        <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black text-slate-800 dark:text-white">
            <HomeClient tracks={tracks} />
        </div>
    );
}