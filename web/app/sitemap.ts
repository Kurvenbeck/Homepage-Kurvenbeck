import type { MetadataRoute } from "next";

const SITE_URL = "https://kurvenbeck.com";

const ROUTES = [
  "",
  "/biergarten",
  "/catering",
  "/backstube",
  "/impressum",
  "/datenschutz",
  "/agb",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
  }));
}
