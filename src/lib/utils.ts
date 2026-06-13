import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * The basePath from next.config.ts. Must match the value set there.
 * This is needed because Next.js does NOT automatically prepend basePath
 * to raw string paths used in <Image src="..."> — it only applies to
 * <Link> and the next/image loader URL.
 */
export const BASE_PATH = process.env.NEXT_STATIC_EXPORT === "true" ? "/mark-ai-creative-portfolio" : ""

/**
 * Resolves a static asset path with the Next.js basePath prepended.
 * On GitHub Pages, the site is served from /mark-ai-creative-portfolio/,
 * so images like /thumbnails/foo.png need to become /mark-ai-creative-portfolio/thumbnails/foo.png.
 * On Vercel (no basePath), the path is returned unchanged.
 */
export function assetPath(path: string): string {
  if (!BASE_PATH) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${BASE_PATH}${normalized}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
