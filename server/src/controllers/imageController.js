const IMAGE_ENDPOINT = "https://api.openai.com/v1/images/generations";

function buildPrompt({ description, outfit, model }) {
  const pieces = (outfit || [])
    .map((item) => `${item.color} ${item.style || ""} ${item.name} (${item.category})`)
    .join(", ");
  const subject = model
    ? "a polished editorial cartoon fashion model wearing the complete outfit"
    : "a premium editorial flat-lay of the complete outfit";

  return `Create ${subject}. Outfit pieces owned by the user: ${pieces || "a cohesive outfit described below"}. Styling direction: ${description || "clean iced latte editorial styling"}. Make every garment recognizable, realistic in material and fit, cohesive in color, and suitable for a modern fashion lookbook. Use soft daylight, creamy oat and pale mocha tones with restrained coffee-ice blue-gray accents. No text, no logos, no extra garments, no watermarks.`;
}

async function generateImage(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("AI image generation is not configured. Add OPENAI_API_KEY to the server environment.");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(IMAGE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.IMAGE_MODEL || "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "high",
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error?.message || "The image provider could not create this look.");
    error.statusCode = response.status >= 500 ? 502 : response.status;
    throw error;
  }
  const image = result.data?.[0];
  if (!image?.url && !image?.b64_json) {
    const error = new Error("The image provider returned no image.");
    error.statusCode = 502;
    throw error;
  }
  return image.url || `data:image/png;base64,${image.b64_json}`;
}

const generateOutfitImages = async (req, res, next) => {
  try {
    const { description, outfit } = req.body || {};
    if (!Array.isArray(outfit) || outfit.length === 0) {
      return res.status(400).json({ success: false, message: "Choose an outfit before generating images." });
    }

    const [editorial, model] = await Promise.all([
      generateImage(buildPrompt({ description, outfit, model: false })),
      generateImage(buildPrompt({ description, outfit, model: true })),
    ]);
    return res.json({ success: true, data: { editorial, model, generatedBy: process.env.IMAGE_MODEL || "gpt-image-1" } });
  } catch (error) {
    return next(error);
  }
};

module.exports = { generateOutfitImages };
