import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { listReservations, listTables } from "../utils/api";
import { next, previous, today } from "../utils/date-time";
import ErrorAlert from "../layout/ErrorAlert";
import Reservations from "../components/Reservations";
import Tables from "../components/Tables";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */

export default function Dashboard({ date }) {
  const history = useHistory();

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    listTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  function handleClick({ target }) {
    let newDate;
    let useDate;

    if (!date) {
      useDate = today();
    } else {
      useDate = date;
    }

    if (target.name === "previous") {
      newDate = previous(useDate);
    } else if (target.name === "next") {
      newDate = next(useDate);
    } else {
      newDate = today();
    }

    history.push(`/dashboard?date=${newDate}`);
  }

  const tableList = tables.map((table) => (
    <Tables loadDashboard={loadDashboard} key={table.table_id} table={table} />
  ));

  const reservationList = reservations.map((reservation) => (
    <Reservations
      loadDashboard={loadDashboard}
      key={reservation.reservation_id}
      reservation={reservation}
    />
  ));

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">NAME</th>
            <th scope="col">PHONE</th>
            <th scope="col">DATE</th>
            <th scope="col">TIME</th>
            <th scope="col">PEOPLE</th>
            <th scope="col">STATUS</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{reservationList}</tbody>
      </table>

      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Tables</h4>
      </div>

      <main>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Table Name</th>
              <th scope="col">Capacity</th>
              <th scope="col">Is Occupied?</th>
              <th scope="col">Meal is Finished</th>
            </tr>
          </thead>
          <tbody>{tableList}</tbody>
        </table>
      </main>

      <div className="row">
        <div className="btn-group col" role="group" aria-label="Basic example">
          <button
            name="previous"
            type="button"
            className="btn btn-info"
            onClick={handleClick}
          >
            <span className="oi oi-chevron-left"></span>
            &nbsp;Previous
          </button>
          <button name="today" type="button" className="btn btn-info" onClick={handleClick}>
            Today
          </button>
          <button name="next" type="button" className="btn btn-info" onClick={handleClick}>
            Next&nbsp;
            <span className="oi oi-chevron-right"></span>
          </button>
        </div>
      </div>
    </main>
  );
}
