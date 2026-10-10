const express = require("express");

const {
  getGarments,
  getGarment,
  createGarment,
  updateGarment,
  deleteGarment,
} = require("../controllers/garmentController");

const router = express.Router();

router.route("/").get(getGarments).post(createGarment);

router
  .route("/:id")
  .get(getGarment)
  .put(updateGarment)
  .delete(deleteGarment);

module.exports = router;