/**
 * Normalise whatever the user pasted into a bare handle.
 *
 * People arrive here having copied a share sheet URL, a profile link with
 * tracking parameters, an @mention, or having typed the name with a trailing
 * space. Getting this wrong means the report deep link points nowhere, which is
 * the one thing that must work.
 */
export function normaliseHandle(input: string): string | null {
  let s = input.trim();
  if (!s) return null;

  // Full URL: take the first path segment.
  const urlMatch = s.match(/^(?:https?:\/\/)?(?:www\.)?(?:instagram|facebook|snapchat|threads|x|twitter)\.com\/([^/?#]+)/i);
  if (urlMatch) s = urlMatch[1]!;

  s = s.replace(/^@+/, "").split(/[?#/]/)[0]!.trim();
  // Instagram allows letters, numbers, periods and underscores.
  if (!/^[A-Za-z0-9._]{1,60}$/.test(s)) return null;
  return s.toLowerCase();
}

export function profileUrl(platform: string, handle: string): string {
  switch (platform) {
    case "facebook":  return `https://facebook.com/${handle}`;
    case "snapchat":  return `https://snapchat.com/add/${handle}`;
    case "x":         return `https://x.com/${handle}`;
    case "instagram":
    default:          return `https://instagram.com/${handle}`;
  }
}
