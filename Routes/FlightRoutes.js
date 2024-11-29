const express = require("express");
const Flight = require("../Models/Flight");
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const flights = await Flight.find();
    if (flights.length === 0) {
      return res.status(404).json({ message: "No flights found." });
    }
    res.json(flights);
  } catch (err) {
    res.status(500).json({ message: "Error fetching flights: " + err.message });
  }
});
router.get("/search", async (req, res) => {
  const { source, destination } = req.query;
  if (!source || !destination) {
    return res
      .status(400)
      .json({ error: "Source and destination are required." });
  }
  try {
    const filteredFlights = await Flight.find({
      source: source,
      destination: destination,
    });
    if (filteredFlights.length === 0) {
      return res
        .status(404)
        .json({ message: "No flights found for the specified route." });
    }
    res.json(filteredFlights);
  } catch (err) {
    res.status(500).json({ message: "Error fetching flights: " + err.message });
  }
});
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Flight.find({}).select(
      "flightId bookedSeats totalFare additionalSelections"
    ); // Modify this based on your schema
    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found." });
    }
    res.json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching bookings: " + err.message });
  }
});
router.post("/bookings", async (req, res) => {
  const { flightId, seats, totalFare, additionalSelections } = req.body;
  if (!flightId || !seats || !totalFare) {
    return res
      .status(400)
      .json({ message: "Flight ID, seats, and total fare are required." });
  }
  try {
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found." });
    }
    const alreadyBookedSeats = seats.filter((seat) =>
      flight.bookedSeats.includes(seat)
    );
    if (alreadyBookedSeats.length > 0) {
      return res.status(400).json({
        message: `Seats already booked: ${alreadyBookedSeats.join(", ")}`,
      });
    }
    flight.bookedSeats = [...new Set([...flight.bookedSeats, ...seats])];
    flight.totalFare = totalFare;
    flight.additionalSelections = additionalSelections;
    await flight.save();
    res
      .status(200)
      .json({ message: "Flight seats updated successfully", flight });
  } catch (error) {
    console.error("Error updating flight booking:", error);
    res.status(500).json({ message: "Error updating flight booking" });
  }
});
router.get("/bookedSeats", async (req, res) => {
  const { flightId } = req.query;
  if (!flightId) {
    return res.status(400).json({ error: "Flight ID is required." });
  }
  try {
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found." });
    }
    res.json({ bookedSeats: flight.bookedSeats });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching booked seats: " + error.message });
  }
});
router.post("/roundbookings", async (req, res) => {
  const {
    outboundFlightId,
    returnFlightId,
    outboundSeats,
    returnSeats,
    totalFare,
    additionalSelections,
  } = req.body;
  if (
    !outboundFlightId ||
    !returnFlightId ||
    !outboundSeats ||
    !returnSeats ||
    totalFare == null
  ) {
    return res.status(400).json({
      message:
        "Both flight IDs, seats for outbound and return flights, and total fare are required.",
    });
  }
  try {
    const outboundFlight = await Flight.findById(outboundFlightId);
    const returnFlight = await Flight.findById(returnFlightId);
    if (!outboundFlight) {
      return res.status(404).json({ message: "Outbound flight not found." });
    }
    if (!returnFlight) {
      return res.status(404).json({ message: "Return flight not found." });
    }
    const alreadyBookedOutboundSeats = outboundSeats.filter((seat) =>
      outboundFlight.bookedSeats.includes(seat)
    );
    if (alreadyBookedOutboundSeats.length > 0) {
      return res.status(400).json({
        message: `Outbound seats already booked: ${alreadyBookedOutboundSeats.join(
          ", "
        )}`,
      });
    }
    const alreadyBookedReturnSeats = returnSeats.filter((seat) =>
      returnFlight.bookedSeats.includes(seat)
    );
    if (alreadyBookedReturnSeats.length > 0) {
      return res.status(400).json({
        message: `Return seats already booked: ${alreadyBookedReturnSeats.join(
          ", "
        )}`,
      });
    }
    outboundFlight.bookedSeats = [
      ...new Set([...outboundFlight.bookedSeats, ...outboundSeats]),
    ];
    returnFlight.bookedSeats = [
      ...new Set([...returnFlight.bookedSeats, ...returnSeats]),
    ];
    outboundFlight.totalFare = totalFare;
    outboundFlight.additionalSelections = additionalSelections;
    await outboundFlight.save();
    await returnFlight.save();
    res.status(200).json({
      message: "Flight seats updated successfully",
      outboundFlight,
      returnFlight,
    });
  } catch (error) {
    console.error("Error updating flight booking:", error);
    res.status(500).json({ message: "Error updating flight booking" });
  }
});
module.exports = router;
