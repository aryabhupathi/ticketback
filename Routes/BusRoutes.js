const express = require("express");
const Bus = require("../Models/Bus");
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const buses = await Bus.find();
    if (buses.length === 0) {
      return res.status(404).json({ message: "No buses found." });
    }
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching buses: " + err.message });
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
    const filteredBuses = await Bus.find({
      source: source,
      destination: destination,
    });
    if (filteredBuses.length === 0) {
      return res
        .status(404)
        .json({ message: "No buses found for the specified route." });
    }
    res.json(filteredBuses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching buses: " + err.message });
  }
});
router.put("/update-bus-seats", async (req, res) => {
  const { busId, updatedSeats, seatNo } = req.body;
  try {
    const result = await Bus.updateOne(
      { _id: busId },
      {
        $set: {
          noOfSeatsAvailable: updatedSeats,
        },
        $addToSet: {
          bookedSeats: { $each: seatNo },
        },
      }
    );
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Seats updated successfully" });
    } else {
      res.status(404).json({ message: "Bus not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update seats", error });
  }
});
module.exports = router;
