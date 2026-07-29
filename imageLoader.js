export default function imageLoader({ src, width, quality }) {
  // If src is undefined, null, or contains 'undefined', return placeholder
  if (!src || src.includes("undefined") || src === "undefined") {
    return "/placeholder-service.png";
  }
  return src;
}
