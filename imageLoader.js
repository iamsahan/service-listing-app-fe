export default function imageLoader({ src, width, quality }) {
  // If src is undefined, null, or contains 'undefined', return placeholder
  if (!src || src.includes("undefined") || src === "undefined") {
    return "/placeholder-service.png";
  }
  
  // Append width to satisfy Next.js loader contract checks
  const connector = src.includes("?") ? "&" : "?";
  return `${src}${connector}w=${width || 300}`;
}
