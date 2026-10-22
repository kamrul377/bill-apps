import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://fnf-travelpay.vercel.app/",
      lastModified: new Date(),
    },
  ];
}