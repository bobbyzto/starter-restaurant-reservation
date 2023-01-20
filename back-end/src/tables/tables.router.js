const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./tables.controller");
/**
 * All allowed HTTP methods for our /tables route are defined here.
 */

// check-in / check-out diners
router
  .route("/:table_id/seat")
  .put(controller.seatTable)
  .delete(controller.finishTable)
  .all(methodNotAllowed);

// create / display tables
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
