import HttpClient from "@/app/utils/httpClient";
import { HomeClient } from "./homeClient";
import type { Track } from "@/app/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let tracks: Track[] = [];

  try {
    const response = await HttpClient.get("/chart/0/tracks?limit=20");
    tracks = response.data.data || [];
  } catch (error) {
    console.error("No fue posible cargar los hits de Deezer", error);
  }

  return <HomeClient tracks={tracks} />;
}
