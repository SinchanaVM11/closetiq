const normalize = (value) => String(value || "").trim().toLowerCase();

const COLOR_MAP = {
  black: "#332923",
  white: "#f8f6f1",
  blue: "#728fa5",
  navy: "#263b59",
  beige: "#cdbca5",
  grey: "#8b8c8a",
  gray: "#8b8c8a",
  brown: "#8a5d43",
  green: "#718777",
  red: "#ad6259",
  pink: "#d09a9b",
  cream: "#ede2cf",
};

function escapeSvg(value) {
  return String(value || "").replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  }[character]));
}

export function garmentFallback(garment = {}) {
  const { category, color, name, style } = garment;
  const fill = COLOR_MAP[normalize(color)] || "#9f7156";
  const safeCategory = normalize(category);
  const label = escapeSvg(name || `${color || "neutral"} ${category || "piece"}`);
  const styleLabel = escapeSvg(style || "personal edit");
  const shape = safeCategory === "shoes"
    ? `<path d="M35 42c14 1 26-3 36-12 6 8 17 13 30 16 8 2 12 8 12 14H35c-5-5-5-12 0-18Z" fill="${fill}"/><path d="M31 60h86" stroke="#332923" stroke-width="3" opacity=".35"/>`
    : safeCategory === "bottom"
      ? `<path d="M52 18h32l6 24-5 34H65l-5-25-6 25H35l5-34Z" fill="${fill}"/><path d="M52 18h32" stroke="#fff" stroke-width="2" opacity=".55"/>`
      : safeCategory === "dress"
        ? `<path d="M58 16h22l4 15 22 43H32l22-43Z" fill="${fill}"/><path d="M58 16c1 7 21 7 22 0" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/>`
        : `<path d="M48 18l12-6h14l12 6 17 14-11 13-8-7v39H46V38l-8 7-11-13Z" fill="${fill}"/><path d="M60 12c0 8 14 8 14 0" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 260"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eee8df"/><stop offset="1" stop-color="#d7e5e5"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-opacity=".16"/></filter></defs><rect width="320" height="260" rx="20" fill="url(#bg)"/><circle cx="260" cy="48" r="42" fill="#fff" opacity=".3"/><path d="M24 216h272" stroke="#fff" stroke-width="2" opacity=".6"/><g transform="translate(85 28) scale(1.1)" filter="url(#shadow)">${shape}</g><text x="24" y="235" fill="#4d3025" font-family="Arial,sans-serif" font-size="13" font-weight="700">${label.slice(0, 34)}</text><text x="24" y="251" fill="#756d67" font-family="Arial,sans-serif" font-size="10">${styleLabel.slice(0, 42)} · ${escapeSvg(category || "garment")}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function findClosestMatches(garments, attributes) {
  const wantedCategories = attributes.categories.length ? attributes.categories : ["top", "bottom", "shoes"];
  const wantedColors = attributes.colors.map(normalize);
  const matches = wantedCategories.map((category) => {
    const candidates = garments.filter((item) => item.category === category);
    if (!candidates.length) return null;
    return candidates.map((garment) => {
      const colorFit = !wantedColors.length ? 60 : wantedColors.includes(normalize(garment.color)) ? 100 : 25;
      return { garment, score: Math.round(colorFit * 0.7 + (garment.imageUrl ? 85 : 50) * 0.3) };
    }).sort((a, b) => b.score - a.score)[0];
  }).filter(Boolean);
  return { matches, missing: wantedCategories.filter((category) => !matches.some((match) => match.garment.category === category)) };
}
