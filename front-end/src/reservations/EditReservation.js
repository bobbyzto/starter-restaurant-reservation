import React, { useState, useEffect } from "react";
import ReservationForm from "./ReservationForm";
import { updateReservation, readReservation } from "../utils/api";
import formatReservationTime from "../utils/format-reservation-time";
import { useParams, useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function EditReservation() {
  const initialState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  };

  const [reservation, setReservation] = useState(initialState);
  const [reservationsError, setReservationsError] = useState(null);
  const [asyncError, setAsyncError] = useState(null);

  const history = useHistory();
  const { reservation_id } = useParams();

  useEffect(() => {
    const abortController = new AbortController();
    setReservationsError(null);
    readReservation(reservation_id, abortController.signal)
      .then((reservation) => setReservation(formatReservationTime(reservation)))
      .catch(setReservationsError);

    return () => abortController.abort();
  }, [reservation_id]);

  async function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();
    try {
      const updatedReservation = await updateReservation(
        reservation_id,
        reservation,
        abortController.signal
      );
      setReservation(updatedReservation);
      const res_date =
        updatedReservation.reservation_date.match(/\d{4}-\d{2}-\d{2}/)[0];
      history.push(`/dashboard?date=${res_date}`);
    } catch (error) {
      setAsyncError(error);
    }
    return () => abortController.abort();
  }

  return (
    <main>
      <ErrorAlert error={asyncError} />
      <ErrorAlert error={reservationsError} />
      <h1>Edit a Reservation</h1>
      <ReservationForm
        reservation={reservation}
        setReservation={setReservation}
        submitHandler={submitHandler}
      />
    </main>
  );
}

export default EditReservation;
