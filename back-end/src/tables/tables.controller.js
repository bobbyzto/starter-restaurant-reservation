const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

const hasValidProperties = hasProperties("table_name", "capacity");
/**
 * These functions validate incoming table form submissions
 * for proper values and formats.
 */
async function tableExists(request, response, next) {
  const { table_id } = request.params;

  const table = await service.read(table_id);
  if (table) {
    response.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table with an id of ${table_id} could not be found.`,
  });
}

async function reservationIdExists(request, response, next) {
  const { reservation_id } = request.body.data;
  const foundReservation = await reservationsService.read(reservation_id);

  if (foundReservation) {
    response.locals.reservation = foundReservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation with an ID of ${reservation_id} could not be found.`,
  });
}

function validateNameLength(request, _response, next) {
  const { data = {} } = request.body;
  if (!data.table_name || data.table_name.length < 2) {
    return next({
      status: 400,
      message: `table_name must be at least two characters.`,
    });
  }
  next();
}

function validateCapacityNumber(request, _response, next) {
  const { data = {} } = request.body;
  if (!data.capacity || typeof data.capacity !== "number") {
    return next({
      status: 400,
      message: `capacity must be a number greater than one.`,
    });
  }
  next();
}

function validateOccupiedForFinish(_request, response, next) {
  const { reservation_id } = response.locals.table;
  if (!reservation_id) {
    return next({
      status: 400,
      message: "Table is not occupied, please pick an occupied table to free.",
    });
  }
  next();
}

// check table reservation / compare table capacity to number of rsvp'd diners
async function validateTableOccupation(_request, response, next) {
  const { table } = response.locals;
  const { reservation } = response.locals;

  if (table.reservation_id) {
    return next({
      status: 400,
      message: `Table is occupied, it has a reservation_id ${table.reservation_id}.`,
    });
  } else if (reservation.people > table.capacity) {
    return next({
      status: 400,
      message: `Number of people exceeds maximum capacity, please choose another table.`,
    });
  } else {
    next();
  }
}

function validateTableNotSeated(_request, response, next) {
  const { status } = response.locals.reservation;
  if (status === "seated") {
    return next({
      status: 400,
      message: "Table is currently seated, please choose an free table.",
    });
  }
  next();
}

/**
 * Route handler functions.
 */
// /GET /tables
async function list(_request, response) {
  response.json({ data: await service.list() });
}

// /POST new table @ /tables
async function create(request, response) {
  const data = await service.create(request.body.data);
  response.status(201).json({ data });
}

// /GET table @ /tables/:table_id
async function read(_request, response) {
  response.json({ data: response.locals.table });
}

// /PUT /tables/:tableId/seat
async function seatTable(_request, response) {
  const { reservation_id } = response.locals.reservation;
  const { table_id } = response.locals.table;

  const data = await service.seatTable(table_id, reservation_id);
  response.json({ data });
}

// /PUT /tables/:tableId/seat
async function finishTable(request, response) {
  const { table_id } = request.params;
  const { reservation_id } = response.locals.table;

  const data = await service.finishTable(table_id, reservation_id);
  response.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasValidProperties,
    validateNameLength,
    validateCapacityNumber,
    asyncErrorBoundary(create),
  ],
  read: [tableExists, asyncErrorBoundary(read)],
  seatTable: [
    hasProperties("reservation_id"),
    asyncErrorBoundary(reservationIdExists),
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(validateTableOccupation),
    validateTableNotSeated,
    asyncErrorBoundary(seatTable),
  ],
  finishTable: [
    asyncErrorBoundary(tableExists),
    validateOccupiedForFinish,
    asyncErrorBoundary(finishTable),
  ],
};
