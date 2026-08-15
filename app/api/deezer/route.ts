import { NextRequest } from "next/server";

const allowedResources = new Set(["album", "artist"]);

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const id = request.nextUrl.searchParams.get("id");
  const subresource = request.nextUrl.searchParams.get("view");

  if (!type || !allowedResources.has(type) || !id || !/^\d+$/.test(id)) {
    return Response.json({ error: "Solicitud no válida" }, { status: 400 });
  }

  const suffix = type === "artist" && subresource === "top" ? "/top?limit=12" : "";
  let response: Response;
  try {
    response = await fetch(`https://api.deezer.com/${type}/${id}${suffix}`, {
      next: { revalidate: 3600 },
    });
  } catch {
    return Response.json({ error: "No fue posible conectar con Deezer" }, { status: 502 });
  }

  if (!response.ok) {
    return Response.json({ error: "Deezer no respondió" }, { status: response.status });
  }

  return Response.json(await response.json());
}
