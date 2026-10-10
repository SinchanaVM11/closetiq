const Garment = require("../models/Garment");

// GET /api/garments
const getGarments = async (req, res, next) => {
  try {
    const garments = await Garment.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: garments.length,
      data: garments,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/garments/:id
const getGarment = async (req, res, next) => {
  try {
    const garment = await Garment.findById(req.params.id);

    if (!garment) {
      return res.status(404).json({
        success: false,
        message: "Garment not found",
      });
    }

    res.json({
      success: true,
      data: garment,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/garments
const createGarment = async (req, res, next) => {
  try {
    const garment = await Garment.create(req.body);

    res.status(201).json({
      success: true,
      data: garment,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/garments/:id
const updateGarment = async (req, res, next) => {
  try {
    const garment = await Garment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!garment) {
      return res.status(404).json({
        success: false,
        message: "Garment not found",
      });
    }

    res.json({
      success: true,
      data: garment,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/garments/:id
const deleteGarment = async (req, res, next) => {
  try {
    const garment = await Garment.findByIdAndDelete(req.params.id);

    if (!garment) {
      return res.status(404).json({
        success: false,
        message: "Garment not found",
      });
    }

    res.json({
      success: true,
      message: "Garment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGarments,
  getGarment,
  createGarment,
  updateGarment,
  deleteGarment,
};