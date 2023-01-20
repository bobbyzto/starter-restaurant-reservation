const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
/**
 * All allowed HTTP methods for our /reservations route are defined here.
 */

// edit a reservation by ID
router
  .route("/:reservation_id/edit")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

// check / update a reservation status by ID
router
  .route("/:reservation_id/status")
  .get(controller.read)
  .put(controller.updateStatus)
  .all(methodNotAllowed);

// check / update reservation info by ID
router
  .route("/:reservation_id")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

// base route: display / create reservations
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
