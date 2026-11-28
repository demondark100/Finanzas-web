import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finanzas-web",
    short_name: "Finanzas",
    description: "Control de finanzas personales, gastos y préstamos",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0284c7",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
