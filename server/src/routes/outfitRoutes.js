
const express = require("express");
const { recommendOutfits } = require("../controllers/outfitController");

const router = express.Router();

router.post("/recommend", recommendOutfits);

module.exports = router;
