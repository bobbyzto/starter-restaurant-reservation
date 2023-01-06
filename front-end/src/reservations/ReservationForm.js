import React from "react";
import { useHistory } from "react-router-dom";

export default function ReservationForm({
  reservation,
  setReservation,
  submitHandler,
}) {
  const history = useHistory();

  const changeHandler = ({ target: { name, value } }) => {
    setReservation((previousState) => ({
      ...previousState,
      [name]: value,
    }));
  };

  const attendeesHandler = ({ target: { name, value } }) => {
    setReservation((previousState) => ({
      ...previousState,
      [name]: Number(value),
    }));
  };

  return (
    <form onSubmit={submitHandler}>
      <em>We look forward to your arrival!</em>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">First name:</label>
        <div className="col-sm-10">
          <input
            className="form-control"
            name="first_name"
            value={reservation.first_name}
            onChange={changeHandler}
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Last name:</label>
        <div className="col-sm-10">
          <input
            className="form-control"
            name="last_name"
            value={reservation.last_name}
            onChange={changeHandler}
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Phone No:</label>
        <div className="col-sm-10">
          <input
            className="form-control"
            name="mobile_number"
            type="tel"
            pattern="[0-9\-]+"
            value={reservation.mobile_number}
            onChange={changeHandler}
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Reservation Date:</label>
        <div className="col-sm-10">
          <input
            className="form-control"
            name="reservation_date"
            type="date"
            value={reservation.reservation_date}
            onChange={changeHandler}
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Time:</label>
        <div className="col-sm-10">
          <input
            className="form-control"
            name="reservation_time"
            type="time"
            value={reservation.reservation_time}
            onChange={changeHandler}
          />
          <small className="col-sm-2">
            *Booking is available between 10:30am and 9:30pm
          </small>
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Attendees:</label>
        <div className="col-sm-10">
          <input
            className="form-control"
            name="people"
            type="number"
            min={1}
            value={reservation.people}
            onChange={attendeesHandler}
          />
        </div>
      </div>
      <div>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
        <button
          className="btn btn-secondary mr-2"
          type="button"
          onClick={history.goBack}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
