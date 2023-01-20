const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

const validStatus = ["booked", "finished", "seated", "cancelled"];
/**
 * These functions validate incoming reservation form request
 * data for proper values and formats.
 */
function hasValidStatus(request, _response, next) {
  const { status } = request.body.data;

  if (!validStatus.includes(status)) {
    return next({
      status: 400,
      message: "unknown status submission.",
    });
  }
  next();
}

const hasValidProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

const validFields = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "reservation_id",
  "created_at",
  "updated_at",
];

function hasValidFields(request, _response, next) {
  const { data = {} } = request.body;

  // catch any invalid field submission
  const invalidFields = Object.keys(data).filter(
    (field) => !validFields.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}.`,
    });
  }

  next();
}

async function reservationExists(request, response, next) {
  const { reservation_id } = request.params || request.body.data;
  const reservation = await service.read(reservation_id);
  if (reservation) {
    response.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `reservation with an ID of ${reservation_id} could not be found.`,
  });
}

async function validateTime(request, _response, next) {
  const { data = {} } = request.body;
  const time = data.reservation_time;

  // check that time is in HH:MM A/PM format
  if (!time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    next({
      status: 400,
      message: "reservation_time must be a valid time format.",
    });
  }
  if (time < "10:30" || time > "21:30") {
    next({
      status: 400,
      message: "reservation_time must be within business hours.",
    });
  }

  next();
}

async function validateDate(request, _response, next) {
  const { data = {} } = request.body;
  const date = new Date(data.reservation_date);
  const day = date.getUTCDay();
  const newDate = new Date();

  if (!Date.parse(date)) {
    next({
      status: 400,
      message: "reservation_date must be a valid date format.",
    });
  }
  if (day === 2) {
    return next({
      status: 400,
      message: `Restaurant closed on Tuesday, please choose a different day of the week.`,
    });
  }
  if ( // check if reservation date is a past date
    JSON.stringify(date).slice(1, 11) < JSON.stringify(newDate).slice(1, 11) &&
    JSON.stringify(date).slice(12, 24) < JSON.stringify(newDate).slice(12, 24)
  ) {
    return next({
      status: 400,
      message: `Reservation must be a future date.`,
    });
  }

  next();
}

function validatePeople(request, _response, next) {
  const { data = {} } = request.body;

  if (!data.people || typeof data.people !== "number") {
    return next({
      status: 400,
      message: `Invalid: people must be a number greater than zero.`,
    });
  }

  next();
}

function validateReservationStatus(request, _response, next) {
  const { status } = request.body.data;

  if (status === "seated") {
    return next({ status: 400, message: `reservation is seated.` });
  }

  if (status === "finished") {
    return next({ status: 400, message: `reservation is finished.` });
  }

  next();
}

/**
 * Request route handler functions.
 */

// /GET all reservations @ /reservations
async function list(request, response) {
  const { date, mobile_number } = request.query;
  const data = await (mobile_number
    ? service.search(mobile_number)
    : service.list(date));
  response.json({ data });
}

// /POST a new reservation @ /reservations
async function create(request, response) {
  const data = await service.create(request.body.data);
  response.status(201).json({ data });
}

// /GET a specific reservation @ /reservations/:reservation_id
function read(_request, response) {
  response.json({ data: response.locals.reservation });
}

// /PUT a reservation's data @ /reservations/:reservation_id
async function update(request, response, next) {
  const updatedReservation = {
    ...request.body.data,
    reservation_id: request.params.reservation_id,
    status: request.body.data.status,
  };

  if (response.locals.reservation.status === "finished") {
    return next({
      status: 400,
      message: "a finished reservation cannot be updated.",
    });
  }

  const data = await service.update(updatedReservation);
  response.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasValidProperties,
    asyncErrorBoundary(validateDate),
    asyncErrorBoundary(validateTime),
    validatePeople,
    validateReservationStatus,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(hasValidFields),
    asyncErrorBoundary(hasValidProperties),
    asyncErrorBoundary(validatePeople),
    asyncErrorBoundary(validateDate),
    asyncErrorBoundary(validateTime),
    asyncErrorBoundary(hasValidStatus),
    asyncErrorBoundary(hasValidFields),
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    hasValidFields,
    hasValidStatus,
    asyncErrorBoundary(update),
  ],
};
