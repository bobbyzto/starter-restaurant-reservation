import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery";

// Component imports
import NewReservation from "../reservations/NewReservation";
import NewTable from "../tables/NewTable";
import SeatTable from "../components/SeatTable";
import Search from "../components/Search";
import Dashboard from "../dashboard/Dashboard";
import EditReservation from "../reservations/EditReservation";
import ReservationStatus from "../reservations/Status";
import NotFound from "./NotFound";
/**
 * Defines all the routes for the application.
 *
 * @returns {JSX.Element}

 */
export default function Routes() {
  const query = useQuery();
  const date = query.get("date");
  //console.log("routes.js", date)
  return (
    <Switch>
      {/* Home page */}
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={date || today()} />
      </Route>
      {/* Reservations page */}
      <Route path="/reservations/new">
        <NewReservation />
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <SeatTable />
      </Route>
      <Route path="/reservations/:reservation_id/status">
        <ReservationStatus />
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <EditReservation />
      </Route>
      {/* Table selection page */}
      <Route exact={true} path="/tables">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/tables/new">
        <NewTable />
      </Route>
      {/* Search page */}
      <Route exact={true} path="/search">
        <Search />
      </Route>
      {/* error handler */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
