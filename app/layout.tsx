import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "TuRolita — música para tu momento",
  description: "Descubre hits, artistas y álbumes con TuRolita.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
