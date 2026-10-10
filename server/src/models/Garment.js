const mongoose = require("mongoose");

const garmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["top", "bottom", "dress", "outerwear", "shoes", "accessory"],
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    style: {
      type: String,
      required: true,
      enum: ["casual", "minimal", "street", "smart", "sporty"],
    },

    occasions: [
      {
        type: String,
        enum: ["college", "work", "casual", "party", "date", "travel"],
      },
    ],

    seasons: [
      {
        type: String,
        enum: ["summer", "winter", "rainy", "all"],
      },
    ],

    imageUrl: {
      type: String,
      default: "",
    },

    timesWorn: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastWorn: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Garment", garmentSchema);