const express = require("express");
const Train = require("../Models/Train");
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const trains = await Train.find();
    if (trains.length === 0) {
      return res.status(404).json({ message: "No trains found." });
    }
    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trains: " + err.message });
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
    const filteredTrains = await Train.find({
      source: source,
      destination: destination,
    });
    if (filteredTrains.length === 0) {
      return res
        .status(404)
        .json({ message: "No trains found for the specified route." });
    }
    res.json(filteredTrains);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trains: " + err.message });
  }
});
router.put("/update-train-seats", async (req, res) => {
  const { trainId, updatedCoaches } = req.body;
  if (!trainId || !updatedCoaches || updatedCoaches.length === 0) {
    return res
      .status(400)
      .json({ message: "Train ID and updated coaches are required" });
  }
  try {
    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }
    updatedCoaches.forEach((updatedCoach) => {
      const coach = train.coaches.find(
        (c) => c.coachName === updatedCoach.coachName
      );
      if (coach) {
        if (
          updatedCoach.reservedSeats >= 0 &&
          updatedCoach.reservedSeats <= coach.noOfSeatsAvailable
        ) {
          coach.noOfSeatsAvailable -= updatedCoach.reservedSeats;
        }
      }
    });
    await train.save();
    res
      .status(200)
      .json({ message: "Seats updated successfully", updatedTrain: train });
  } catch (error) {
    res.status(500).json({ message: "Failed to update seats", error });
  }
});
module.exports = router;
