import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Illy Jobs - Ilorin Job Portal",
    short_name: "Illy Jobs",
    description: "Hyper-Local Job Search & Talent Connection Platform for Ilorin City & Kwara State",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#6FBE44",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
