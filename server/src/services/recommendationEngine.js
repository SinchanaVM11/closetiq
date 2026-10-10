const COLOR_PAIRS = {
  black: ["white", "beige", "grey", "gray", "blue", "pink", "red", "cream"],
  white: ["black", "blue", "navy", "beige", "grey", "gray", "brown", "green"],
  blue: ["white", "beige", "grey", "gray", "brown", "cream"],
  navy: ["white", "beige", "grey", "gray", "cream"],
  beige: ["black", "white", "blue", "navy", "brown", "green"],
  grey: ["black", "white", "blue", "navy", "pink"],
  gray: ["black", "white", "blue", "navy", "pink"],
  brown: ["white", "beige", "blue", "cream", "green"],
  green: ["white", "beige", "brown", "cream"],
  red: ["black", "white", "navy", "beige"],
  pink: ["black", "white", "grey", "gray", "navy"],
  cream: ["black", "blue", "navy", "brown", "green"],
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function colorCompatibility(first, second) {
  const colorA = normalize(first);
  const colorB = normalize(second);

  if (!colorA || !colorB) return 50;
  if (colorA === colorB) return 65;

  if (
    (COLOR_PAIRS[colorA] || []).includes(colorB) ||
    (COLOR_PAIRS[colorB] || []).includes(colorA)
  ) {
    return 95;
  }

  return 60;
}

function occasionMatch(garment, occasion) {
  if (!occasion) return 70;

  const occasions = (garment.occasions || []).map(normalize);
  return occasions.includes(normalize(occasion)) ? 100 : 45;
}

function styleMatch(garment, style) {
  if (!style) return 70;

  return normalize(garment.style) === normalize(style) ? 100 : 40;
}

function weatherMatch(garment, weather) {
  if (!weather) return 70;

  const seasons = (garment.seasons || []).map(normalize);
  const conditions = normalize(weather);

  if (seasons.includes("all")) return 85;

  if (seasons.includes(conditions)) return 100;

  if (
    ["warm", "hot", "sunny"].includes(conditions) &&
    seasons.includes("summer")
  ) {
    return 100;
  }

  if (
    ["cold", "cool", "chilly"].includes(conditions) &&
    seasons.includes("winter")
  ) {
    return 100;
  }

  if (
    ["rain", "rainy", "monsoon"].includes(conditions) &&
    seasons.includes("rainy")
  ) {
    return 100;
  }

  return 45;
}

function freshnessMatch(garment) {
  const timesWorn = Number(garment.timesWorn || 0);
  return Math.max(35, 100 - timesWorn * 10);
}

function scoreOutfit(items, context = {}) {
  const [top, bottom, shoes] = items;

  const colorScores = [
    colorCompatibility(top.color, bottom.color),
    colorCompatibility(top.color, shoes.color),
    colorCompatibility(bottom.color, shoes.color),
  ];

  const colorScore = Math.round(
    colorScores.reduce((sum, score) => sum + score, 0) /
      colorScores.length
  );

  const occasionScore = Math.round(
    items.reduce(
      (sum, item) => sum + occasionMatch(item, context.occasion),
      0
    ) / items.length
  );

  const styleScore = Math.round(
    items.reduce(
      (sum, item) => sum + styleMatch(item, context.style),
      0
    ) / items.length
  );

  const weatherScore = Math.round(
    items.reduce(
      (sum, item) => sum + weatherMatch(item, context.weather),
      0
    ) / items.length
  );

  const freshnessScore = Math.round(
    items.reduce((sum, item) => sum + freshnessMatch(item), 0) /
      items.length
  );

  const score = Math.round(
    occasionScore * 0.3 +
      styleScore * 0.25 +
      colorScore * 0.2 +
      weatherScore * 0.15 +
      freshnessScore * 0.1
  );

  const reasons = [];

  if (occasionScore >= 75) {
    reasons.push("Matches your selected occasion");
  }

  if (styleScore >= 75) {
    reasons.push("Fits your preferred style");
  }

  if (colorScore >= 80) {
    reasons.push("Colors work well together");
  }

  if (weatherScore >= 75) {
    reasons.push("Suitable for the selected weather");
  }

  if (freshnessScore >= 75) {
    reasons.push("Includes items you have worn less often");
  }

  return {
    score,
    items,
    factors: {
      occasion: occasionScore,
      style: styleScore,
      color: colorScore,
      weather: weatherScore,
      freshness: freshnessScore,
    },
    reasons,
  };
}

function generateOutfits(garments, context = {}) {
  const tops = garments.filter((item) => item.category === "top");
  const bottoms = garments.filter((item) => item.category === "bottom");
  const shoesList = garments.filter((item) => item.category === "shoes");

  const outfits = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoes of shoesList) {
        const items = [top, bottom, shoes];

        outfits.push(scoreOutfit(items, context));
      }
    }
  }

  outfits.sort((a, b) => b.score - a.score);

  const titles = [
    "The Everyday Edit",
    "The Easy Classic",
    "The Off-Duty Look",
  ];

  return outfits.slice(0, 3).map((outfit, index) => ({
    ...outfit,
    rank: index + 1,
    title: titles[index],
  }));
}

module.exports = { generateOutfits };