const express = require("express");
const { generateOutfitImages } = require("../controllers/imageController");

const router = express.Router();
router.post("/outfit", generateOutfitImages);

module.exports = router;
