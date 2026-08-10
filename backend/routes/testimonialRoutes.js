const express = require("express");
const Testimonial = require("../models/Testimonial");
const createCrudController = require("../controllers/crudControllerFactory");
const { protect, authorize, optionalAuth } = require("../middleware/auth");

const router = express.Router();

const ctrl = createCrudController(Testimonial, {
  populate: [
    {
      path: "country",
      select: "name slug",
    },
    {
      path: "university",
      select: "name slug",
    },
  ],
  sort: {
    displayOrder: 1,
    createdAt: -1,
  },
  resourceName: "Testimonial",
});

// ============================================================
// PUBLIC ROUTES
// ============================================================

router.get("/", optionalAuth, ctrl.list);
router.get("/:id", optionalAuth, ctrl.getOne);

// ============================================================
// PROTECTED MANAGEMENT ROUTES
// ============================================================

router.use(
  protect,
  authorize("super_admin", "admin", "content_manager", "marketing_manager"),
);

router.post("/", ctrl.create);
router.put("/:id", ctrl.update);

router.delete("/:id", authorize("super_admin", "admin"), ctrl.remove);

module.exports = router;
