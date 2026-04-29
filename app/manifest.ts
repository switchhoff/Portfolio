import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Offswitch by Hofmann",
    short_name: "Offswitch",
    description: "Forward-deployed engineer. I build systems end-to-end.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f0a",
    theme_color: "#0a0f0a",
    icons: [
      {
        src: "/PowerLogo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/PowerLogo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
