const mongoose = require("mongoose");
const busSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  stops: {
    type: [String],
    default: [],
  },
  busName: {
    type: String,
    required: true,
  },
  baseFare: {
    type: Number,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  noOfSeatsAvailable: {
    type: Number,
    required: true,
  },
  bookedSeats: {
    type: [String],
    default: [],
  },
  layout: {
    rows: {
      type: Number,
      required: true,
    },
    seatsPerRow: {
      type: Number,
      required: true,
    },
    seatConfiguration: {
      type: [[String]],
      required: true,
    },
  },
});
module.exports = mongoose.model("Bus", busSchema, "bus");
