const normalize = (value) => String(value || "").trim().toLowerCase();

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
