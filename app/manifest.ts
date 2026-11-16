import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Illy Jobs - Jobs in Ilorin",
    short_name: "Illy Jobs",
    description: "Local job board for Ilorin and Kwara State.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#047857",
    lang: "en-NG",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
