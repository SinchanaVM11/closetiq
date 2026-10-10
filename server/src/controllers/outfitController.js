
const Garment = require("../models/Garment");
const { generateOutfits } = require("../services/recommendationEngine");

const recommendOutfits = async (req, res, next) => {
  try {
    const { occasion, weather, style } = req.body || {};

    const garments = await Garment.find();

    const outfits = generateOutfits(garments, {
      occasion,
      weather,
      style,
    });

    res.json({
      success: true,
      count: outfits.length,
      context: { occasion, weather, style },
      data: outfits,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { recommendOutfits };
